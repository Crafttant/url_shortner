// Request payload validator layer for URL operations
function validateCreateURL(req, res, next) {
  const { url, customAlias } = req.body;

  if (!url) {
    return res.status(400).json({ error: "url is required" });
  }

  // Validate absolute URL format
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error();
    }
  } catch (e) {
    return res.status(400).json({
      error: "Please enter a valid absolute URL (e.g. https://google.com)",
    });
  }

  // Validate custom alias formatting if provided
  if (customAlias) {
    const alias = customAlias.trim();
    if (!/^[a-zA-Z0-9-_]+$/.test(alias)) {
      return res.status(400).json({
        error: "Custom alias can only contain letters, numbers, dashes, and underscores",
      });
    }
  }

  next();
}

function validateUpdateURL(req, res, next) {
  const { redirectURL, expiresAt } = req.body;

  if (redirectURL !== undefined) {
    if (!redirectURL) {
      return res.status(400).json({ error: "Destination URL cannot be empty" });
    }
    try {
      const parsed = new URL(redirectURL);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error();
      }
    } catch (e) {
      return res.status(400).json({
        error: "Please enter a valid absolute URL (e.g. https://google.com)",
      });
    }
  }

  if (expiresAt !== undefined && expiresAt !== null && expiresAt !== "") {
    const timestamp = Date.parse(expiresAt);
    if (isNaN(timestamp)) {
      return res.status(400).json({ error: "Invalid expiration date format" });
    }
  }

  next();
}

module.exports = {
  validateCreateURL,
  validateUpdateURL,
};
