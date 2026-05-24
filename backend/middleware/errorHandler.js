const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

/**
 * Logs an error using the shared structured logger.
 *
 * @param {Error} err Error instance.
 * @param {import("express").Request} req Express request.
 * @param {number} statusCode HTTP status code to log.
 * @param {string} message Normalized error message.
 * @returns {void}
 */
function logError(err, req, statusCode, message) {
  logger.error("Request failed", {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
}

/**
 * Converts unmatched routes into application-level 404 errors.
 *
 * @param {import("express").Request} req Express request.
 * @param {import("express").Response} res Express response.
 * @param {import("express").NextFunction} next Express next function.
 * @returns {void}
 */
function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Centralized Express error handler for operational and unexpected errors.
 *
 * @param {Error} err Error instance.
 * @param {import("express").Request} req Express request.
 * @param {import("express").Response} res Express response.
 * @param {import("express").NextFunction} next Express next function.
 * @returns {import("express").Response}
 */
function errorHandler(err, req, res, next) {
  const isKnownError = err instanceof ApiError;
  const statusCode = isKnownError ? err.statusCode : err.statusCode || 500;
  const message = isKnownError ? err.message : err.message || "Internal server error";

  if (err.code === 11000) {
    logError(err, req, 409, "A unique field already exists with the provided value");
    return res.status(409).json({
      success: false,
      message: "A unique field already exists with the provided value"
    });
  }

  if (err.name === "ValidationError") {
    logError(err, req, 400, "Validation failed");
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(err.errors).map((error) => error.message)
    });
  }

  if (err.name === "CastError") {
    logError(err, req, 400, `Invalid value for field: ${err.path}`);
    return res.status(400).json({
      success: false,
      message: `Invalid value for field: ${err.path}`
    });
  }

  if (err.name === "MulterError") {
    const uploadMessage = err.code === "LIMIT_FILE_SIZE"
      ? "Uploaded file exceeds the 5MB limit"
      : "File upload failed";
    logError(err, req, 400, uploadMessage);
    return res.status(400).json({
      success: false,
      message: uploadMessage
    });
  }

  logError(err, req, statusCode, message);

  const response = {
    success: false,
    message,
    requestId: req.id
  };

  if (process.env.NODE_ENV !== "production" && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

module.exports = {
  notFoundHandler,
  errorHandler
};
