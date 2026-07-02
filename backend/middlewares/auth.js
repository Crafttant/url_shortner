const { getAuth } = require("@clerk/express");

function apiRequireAuth(req, res, next) {
  const auth = getAuth(req);
  if (!auth.userId) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token." });
  }
  next();
}

module.exports = { apiRequireAuth };
