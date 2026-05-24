/**
 * Wraps an async Express handler and forwards rejected promises to the
 * centralized error handler.
 *
 * @param {Function} handler Async Express route or middleware handler.
 * @returns {Function} Express-compatible handler.
 */
module.exports = function asyncHandler(handler) {
  return function asyncRouteHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
