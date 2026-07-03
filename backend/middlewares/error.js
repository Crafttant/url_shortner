const sanitizeUrl = (url) => (url ? url.trim().toLowerCase().replace(/\/$/, "") : "");

const allowedOrigins = [
  "http://localhost:5173",
  sanitizeUrl(process.env.FRONTEND_URL)
].filter(Boolean);

// Centralized Error Handling Middleware for production status codes and sanitization
function errorHandler(err, req, res, next) {
  console.error("Centralized Error Catch:", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  const origin = req.headers.origin;
  if (origin) {
    const cleanOrigin = sanitizeUrl(origin);
    const isVercelPreview = /^https:\/\/url-shortner-.*\.vercel\.app$/.test(cleanOrigin);
    if (allowedOrigins.includes(cleanOrigin) || isVercelPreview) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    error: message,
    // Hide details in production environments for security
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

module.exports = { errorHandler };
