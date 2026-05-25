const ApiError = require("../utils/apiError");

/**
 * Builds the CORS configuration from environment variables.
 *
 * @returns {import("cors").CorsOptions}
 */
function buildCorsOptions() {
  const envOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowedOrigins = [
    ...new Set([
      ...envOrigins,
      "https://smart-campus-khaki.vercel.app"
    ])
  ];

  const allowAllOrigins = allowedOrigins.length === 0;

  return {
    origin(origin, callback) {
      if (allowAllOrigins || !origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin is not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  };
}

/**
 * Applies response security headers to every request.
 *
 * @param {import("express").Request} req Express request.
 * @param {import("express").Response} res Express response.
 * @param {import("express").NextFunction} next Express next function.
 * @returns {void}
 */
function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  next();
}

/**
 * Rejects duplicate query parameters to avoid HTTP parameter pollution.
 *
 * @param {import("express").Request} req Express request.
 * @param {import("express").Response} res Express response.
 * @param {import("express").NextFunction} next Express next function.
 * @returns {void}
 */
function preventHttpParameterPollution(req, res, next) {
  const duplicateParams = Object.entries(req.query).filter(([, value]) => Array.isArray(value));

  if (duplicateParams.length > 0) {
    return next(new ApiError(400, "Duplicate query parameters are not allowed"));
  }

  return next();
}

module.exports = {
  buildCorsOptions,
  preventHttpParameterPollution,
  securityHeaders
};
