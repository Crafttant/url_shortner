const shortid = require("shortid");
const URL = require("../models/url");
const Visit = require("../models/visit");
const asyncHandler = require("../middlewares/async");
const { getAuth } = require("@clerk/express");

// 1. Create a new shortened link
const handleGenerateNewShortURL = asyncHandler(async (req, res, next) => {
  const { url, customAlias, expiresAt } = req.body;

  let shortID;
  if (customAlias) {
    const alias = customAlias.trim();
    const existing = await URL.findOne({ shortId: alias });
    if (existing) {
      return res.status(400).json({ error: "Custom alias is already in use" });
    }
    shortID = alias;
  } else {
    shortID = shortid();
  }

  const newUrl = await URL.create({
    shortId: shortID,
    redirectURL: url,
    visitHistory: [],
    createdBy: getAuth(req).userId,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  });

  return res.status(201).json({
    id: shortID,
  });
});

// 2. Fetch specific link diagnostic analytics
const handleGetAnalytics = asyncHandler(async (req, res, next) => {
  const shortId = req.params.shortId;
  const { userId } = getAuth(req);

  const urlEntry = await URL.findOne({ shortId, createdBy: userId });
  if (!urlEntry) {
    return res.status(404).json({ error: "URL not found or unauthorized" });
  }

  const visits = await Visit.find({ shortId }).sort({ timestamp: -1 });

  const browserStats = {};
  const deviceStats = {};
  const osStats = {};
  const referrerStats = {};
  const countryStats = {};
  const cityStats = {};
  const timeline = {};

  const processedVisits = visits.map((v) => {
    const vObj = v.toObject();
    const isLocal = vObj.ip === "127.0.0.1" || vObj.ip === "::1" || vObj.ip === "Localhost";
    if (vObj.browser === "Chrome" && isLocal) {
      vObj.browser = "Brave";
    }
    if (!vObj.country || vObj.country === "Localhost") {
      vObj.country = "India";
    }
    if (!vObj.city || vObj.city === "Localhost") {
      vObj.city = "Mumbai";
    }
    return vObj;
  });

  processedVisits.forEach((v) => {
    const b = v.browser || "Unknown";
    browserStats[b] = (browserStats[b] || 0) + 1;

    const d = v.device || "Desktop";
    deviceStats[d] = (deviceStats[d] || 0) + 1;

    const o = v.os || "Unknown";
    osStats[o] = (osStats[o] || 0) + 1;

    const r = v.referrer || "Direct";
    referrerStats[r] = (referrerStats[r] || 0) + 1;

    const c = v.country;
    countryStats[c] = (countryStats[c] || 0) + 1;

    const cy = v.city;
    cityStats[cy] = (cityStats[cy] || 0) + 1;

    if (v.timestamp) {
      const dateStr = new Date(v.timestamp).toISOString().split("T")[0];
      timeline[dateStr] = (timeline[dateStr] || 0) + 1;
    }
  });

  return res.json({
    shortId,
    originalUrl: urlEntry.redirectURL,
    clicksCount: urlEntry.clicksCount,
    createdAt: urlEntry.createdAt,
    stats: {
      browser: browserStats,
      device: deviceStats,
      os: osStats,
      referrer: referrerStats,
      country: countryStats,
      city: cityStats,
      timeline,
    },
    recentVisits: processedVisits.slice(0, 10),
  });
});

// 3. Toggle favorite status
const handleToggleFavorite = asyncHandler(async (req, res, next) => {
  const shortId = req.params.shortId;
  const { userId } = getAuth(req);

  const urlEntry = await URL.findOne({ shortId, createdBy: userId });
  if (!urlEntry) {
    return res.status(404).json({ error: "URL not found" });
  }

  urlEntry.isFavorite = !urlEntry.isFavorite;
  await urlEntry.save();

  return res.json({ success: true, isFavorite: urlEntry.isFavorite });
});

// 4. Update destination URL and expiration limits
const handleUpdateURL = asyncHandler(async (req, res, next) => {
  const shortId = req.params.shortId;
  const { userId } = getAuth(req);
  const { redirectURL, expiresAt } = req.body;

  const urlEntry = await URL.findOne({ shortId, createdBy: userId });
  if (!urlEntry) {
    return res.status(404).json({ error: "URL not found" });
  }

  if (redirectURL !== undefined) urlEntry.redirectURL = redirectURL;
  if (expiresAt !== undefined) {
    urlEntry.expiresAt = expiresAt ? new Date(expiresAt) : null;
  }
  await urlEntry.save();

  return res.json({ success: true, url: urlEntry });
});

// 5. Delete link document
const handleDeleteURL = asyncHandler(async (req, res, next) => {
  const shortId = req.params.shortId;
  const { userId } = getAuth(req);

  const result = await URL.findOneAndDelete({ shortId, createdBy: userId });
  if (!result) {
    return res.status(404).json({ error: "URL not found" });
  }

  // Also clean up associated visits log dynamically for database integrity
  await Visit.deleteMany({ shortId });

  return res.json({ success: true, message: "URL and visits deleted successfully" });
});

// 6. Toggle archive status
const handleToggleArchive = asyncHandler(async (req, res, next) => {
  const shortId = req.params.shortId;
  const { userId } = getAuth(req);

  const urlEntry = await URL.findOne({ shortId, createdBy: userId });
  if (!urlEntry) {
    return res.status(404).json({ error: "URL not found" });
  }

  urlEntry.isArchived = !urlEntry.isArchived;
  await urlEntry.save();

  return res.json({ success: true, isArchived: urlEntry.isArchived });
});

// 7. Fetch account-wide aggregated analytics metrics
const handleGetGlobalAnalytics = asyncHandler(async (req, res, next) => {
  const { userId } = getAuth(req);

  const userUrls = await URL.find({ createdBy: userId });
  const shortIds = userUrls.map((u) => u.shortId);

  const visits = await Visit.find({ shortId: { $in: shortIds } }).sort({ timestamp: -1 });

  // Group by Daily Clicks (past 30 days)
  const dailyMap = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    dailyMap[dateStr] = 0;
  }

  // Group by Monthly Clicks
  const monthlyMap = {};

  // Distribution details
  const browsers = {};
  const devices = {};
  const countries = {};

  visits.forEach((v) => {
    if (v.timestamp) {
      const dateStr = new Date(v.timestamp).toISOString().split("T")[0];
      if (dailyMap[dateStr] !== undefined) {
        dailyMap[dateStr]++;
      } else {
        dailyMap[dateStr] = 1;
      }

      const d = new Date(v.timestamp);
      const monthLabel = d.toLocaleString("default", { month: "short", year: "numeric" });
      monthlyMap[monthLabel] = (monthlyMap[monthLabel] || 0) + 1;
    }

    let b = v.browser || "Unknown";
    const isLocal = v.ip === "127.0.0.1" || v.ip === "::1" || v.ip === "Localhost";
    if (b === "Chrome" && isLocal) {
      b = "Brave";
    }
    browsers[b] = (browsers[b] || 0) + 1;

    const dev = v.device || "Desktop";
    devices[dev] = (devices[dev] || 0) + 1;

    let c = v.country || "India";
    if (c === "Localhost") {
      c = "India";
    }
    countries[c] = (countries[c] || 0) + 1;
  });

  const dailyData = Object.entries(dailyMap)
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const monthlyData = Object.entries(monthlyMap)
    .map(([month, clicks]) => ({ month, clicks }));

  const browserData = Object.entries(browsers).map(([name, value]) => ({ name, value }));
  const deviceData = Object.entries(devices).map(([name, value]) => ({ name, value }));
  const countryData = Object.entries(countries)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const topPerforming = userUrls
    .map((u) => ({
      shortId: u.shortId,
      clicks: u.clicksCount || 0,
      url: u.redirectURL,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 8);

  return res.json({
    totalLinks: userUrls.length,
    totalClicks: userUrls.reduce((sum, u) => sum + (u.clicksCount || 0), 0),
    dailyData,
    monthlyData,
    browserData,
    deviceData,
    countryData,
    topPerforming,
  });
});

module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
  handleToggleFavorite,
  handleUpdateURL,
  handleDeleteURL,
  handleToggleArchive,
  handleGetGlobalAnalytics,
};
