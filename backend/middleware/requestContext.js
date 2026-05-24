const crypto = require("crypto");

/**
 * Attaches a unique request id and request timestamp to the current request.
 *
 * @param {import("express").Request} req Express request.
 * @param {import("express").Response} res Express response.
 * @param {import("express").NextFunction} next Express next function.
 * @returns {void}
 */
function attachRequestContext(req, res, next) {
  req.id = crypto.randomUUID();
  req.requestTime = new Date().toISOString();
  res.setHeader("X-Request-Id", req.id);
  next();
}

module.exports = attachRequestContext;
