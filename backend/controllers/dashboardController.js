const asyncHandler = require("../utils/asyncHandler");
const dashboardService = require("../services/dashboardService");

/**
 * Returns the base dashboard summary for the current user.
 */
exports.getDashboardSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardSummary(req.user);

  return res.status(200).json({
    success: true,
    message: "Dashboard data fetched successfully",
    data
  });
});

/**
 * Returns the staff/admin assigned issue dashboard.
 */
exports.getStaffDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStaffDashboard(req.user, req.query);

  return res.status(200).json({
    success: true,
    message: "Staff dashboard data fetched successfully",
    data
  });
});

/**
 * Returns analytics aggregates for staff/admin dashboards.
 */
exports.getAnalytics = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAnalytics(req.user, req.query);

  return res.status(200).json({
    success: true,
    message: "Analytics fetched successfully",
    data
  });
});
