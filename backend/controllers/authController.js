const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");

/**
 * Registers a new user account.
 */
exports.register = asyncHandler(async (req, res) => {
  const data = await authService.registerUser(req.body);

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data
  });
});

/**
 * Authenticates a user and returns a bearer token.
 */
exports.login = asyncHandler(async (req, res) => {
  const data = await authService.loginUser(req.body);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data
  });
});

/**
 * Returns the authenticated user's profile.
 */
exports.getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Authenticated user fetched successfully",
    data: {
      user: authService.getCurrentUser(req.user)
    }
  });
});
