const express = require("express");
const { apiRequireAuth } = require("../middlewares/auth");
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

router.post("/", apiRequireAuth, validateCreateURL, handleGenerateNewShortURL);

router.get("/analytics/summary", apiRequireAuth, handleGetGlobalAnalytics);

router.get("/analytics/:shortId", apiRequireAuth, handleGetAnalytics);

router.patch("/:shortId/favorite", apiRequireAuth, handleToggleFavorite);

router.put("/:shortId", apiRequireAuth, validateUpdateURL, handleUpdateURL);

router.delete("/:shortId", apiRequireAuth, handleDeleteURL);

router.patch("/:shortId/archive", apiRequireAuth, handleToggleArchive);

module.exports = router;
