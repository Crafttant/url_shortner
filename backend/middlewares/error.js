// Centralized Error Handling Middleware for production status codes and sanitization
function errorHandler(err, req, res, next) {
  console.error("Centralized Error Catch:", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

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
