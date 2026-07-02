const express = require("express");
const { requireAuth } = require("@clerk/express");
const { validateCreateURL, validateUpdateURL } = require("../middlewares/validate");
const {
  handleGenerateNewShortURL,
  handleGetAnalytics,
  handleToggleFavorite,
  handleUpdateURL,
  handleDeleteURL,
  handleToggleArchive,
  handleGetGlobalAnalytics,
} = require("../controllers/url");

const router = express.Router();

router.post("/", requireAuth(), validateCreateURL, handleGenerateNewShortURL);

router.get("/analytics/summary", requireAuth(), handleGetGlobalAnalytics);

router.get("/analytics/:shortId", requireAuth(), handleGetAnalytics);

router.patch("/:shortId/favorite", requireAuth(), handleToggleFavorite);

router.put("/:shortId", requireAuth(), validateUpdateURL, handleUpdateURL);

router.delete("/:shortId", requireAuth(), handleDeleteURL);

router.patch("/:shortId/archive", requireAuth(), handleToggleArchive);

module.exports = router;
