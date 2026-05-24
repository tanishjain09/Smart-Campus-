const ApiError = require("../utils/apiError");

/**
 * In-memory request counters keyed by client and route.
 */
const buckets = new Map();

// Cleanup expired buckets every 60 seconds to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}, 60 * 1000).unref();

/**
 * Resolves the most specific client key available for rate limiting.
 *
 * @param {import("express").Request} req Express request.
 * @returns {string}
 */
function getClientKey(req) {
  return req.ip || req.headers["x-forwarded-for"] || "unknown";
}

/**
 * Creates a lightweight in-memory rate limiter middleware.
 *
 * @param {{windowMs: number, maxRequests: number}} options Rate limiting options.
 * @returns {import("express").RequestHandler}
 */
function createRateLimiter({ windowMs, maxRequests }) {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${getClientKey(req)}:${req.baseUrl}${req.path}`;
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= maxRequests) {
      res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
      return next(new ApiError(429, "Too many requests. Please try again later."));
    }

    bucket.count += 1;
    return next();
  };
}

module.exports = {
  createRateLimiter
};
