const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/userService");

/**
 * Returns all users (admin only).
 */
exports.listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers(req.query);

  return res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: { users }
  });
});
