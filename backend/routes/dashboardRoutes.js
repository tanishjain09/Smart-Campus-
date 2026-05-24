const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  validateAnalyticsQuery,
  validateDashboardRequest,
  validateStaffDashboardQuery
} = require("../validators/dashboardValidators");

/**
 * Dashboard routes for summary, staff workload, and analytics views.
 */
const router = express.Router();

router.get("/", protect, validateRequest([validateDashboardRequest]), dashboardController.getDashboardSummary);
router.get(
  "/staff",
  protect,
  authorize("staff", "admin"),
  validateRequest([validateStaffDashboardQuery]),
  dashboardController.getStaffDashboard
);
router.get(
  "/analytics",
  protect,
  authorize("staff", "admin"),
  validateRequest([validateAnalyticsQuery]),
  dashboardController.getAnalytics
);

module.exports = router;
