const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const authService = require("../services/authService");

/**
 * Extracts a bearer token from the request authorization header.
 *
 * @param {import("express").Request} req Express request.
 * @returns {string|null}
 */
function getTokenFromRequest(req) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

/**
 * Authenticates the incoming request and attaches the resolved user to
 * `req.user`.
 */
exports.protect = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new ApiError(401, "Authentication token is required");
  }

  req.user = await authService.getUserFromToken(token);
  next();
});

/**
 * Creates role-based authorization middleware for protected routes.
 *
 * @param {...string} roles Allowed user roles.
 * @returns {import("express").RequestHandler}
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication is required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You are not authorized to perform this action"));
    }

    return next();
  };
};
