const express = require("express");
const URL = require("../models/url");
const Visit = require("../models/visit");

const { requireAuth, getAuth } = require("@clerk/express");

const router = express.Router();

router.get("/", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const filter = req.query.filter || "all";
  const sort = req.query.sort || "latest";

  const query = { createdBy: userId };

  // Search logic (case insensitive)
  if (search) {
    query.$or = [
      { shortId: { $regex: search, $options: "i" } },
      { redirectURL: { $regex: search, $options: "i" } },
    ];
  }

  // Filter logic
  const now = new Date();
  if (filter === "favorites") {
    query.isFavorite = true;
    query.isArchived = { $ne: true };
  } else if (filter === "active") {
    query.isArchived = { $ne: true };
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gte: now } },
    ];
  } else if (filter === "expired") {
    query.isArchived = { $ne: true };
    query.expiresAt = { $lt: now };
  } else if (filter === "archived") {
    query.isArchived = true;
  } else {
    // "all"
    query.isArchived = { $ne: true };
  }

  try {
    // Sort logic
    let sortQuery = {};
    if (sort === "most-clicked") {
      sortQuery = { clicksCount: -1 };
    } else if (sort === "oldest") {
      sortQuery = { createdAt: 1 };
    } else {
      // default "latest"
      sortQuery = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;
    const total = await URL.countDocuments(query);
    const urls = await URL.find(query).sort(sortQuery).skip(skip).limit(limit);

    // Compute overall stats across all user links for the dashboard
    const allUserUrls = await URL.find({ createdBy: userId });
    
    // Fetch visits to populate visitHistory for RecentActivity
    const shortIds = allUserUrls.map((u) => u.shortId);
    const visits = await Visit.find({ shortId: { $in: shortIds } });

    const visitsByShortId = {};
    visits.forEach((v) => {
      if (!visitsByShortId[v.shortId]) {
        visitsByShortId[v.shortId] = [];
      }
      const timeVal = v.timestamp ? new Date(v.timestamp).getTime() : new Date(v.createdAt).getTime();
      visitsByShortId[v.shortId].push({ timestamp: timeVal });
    });

    // Map urls to plain objects and attach visitHistory
    const urlsWithHistory = urls.map((u) => {
      const uObj = u.toObject();
      uObj.visitHistory = visitsByShortId[u.shortId] || [];
      return uObj;
    });

    let totalClicks = allUserUrls.reduce((sum, u) => sum + (u.clicksCount || 0), 0);
    let activeCount = 0;
    let expiredCount = 0;
    let favoritesCount = 0;
    let archivedCount = 0;

    allUserUrls.forEach((url) => {
      if (url.isArchived) {
        archivedCount++;
      } else {
        const isExpired = url.expiresAt && new Date(url.expiresAt) < now;
        if (isExpired) {
          expiredCount++;
        } else {
          activeCount++;
        }
      }
      if (url.isFavorite) {
        favoritesCount++;
      }
    });

    return res.json({
      urls: urlsWithHistory,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: allUserUrls.length - archivedCount, // total active & expired (archived excluded)
        clicks: totalClicks,
        active: activeCount,
        expired: expiredCount,
        favorites: favoritesCount,
        archived: archivedCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
