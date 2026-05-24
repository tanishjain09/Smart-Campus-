const { parsePositiveInteger } = require("../utils/validation");

/**
 * Placeholder dashboard validator to keep the middleware contract uniform.
 *
 * @returns {null}
 */
function validateDashboardRequest() {
  return null;
}

/**
 * Validates analytics query parameters.
 *
 * @param {import("express").Request} req Express request.
 * @returns {string|null}
 */
function validateAnalyticsQuery(req) {
  const { days } = req.query;

  if (days !== undefined && parsePositiveInteger(days, null) === null) {
    return "days must be a positive integer";
  }

  return null;
}

/**
 * Validates staff dashboard pagination query parameters.
 *
 * @param {import("express").Request} req Express request.
 * @returns {string|null}
 */
function validateStaffDashboardQuery(req) {
  const { page, limit } = req.query;

  if (page !== undefined && parsePositiveInteger(page, null) === null) {
    return "page must be a positive integer";
  }

  if (limit !== undefined && parsePositiveInteger(limit, null) === null) {
    return "limit must be a positive integer";
  }

  return null;
}

module.exports = {
  validateAnalyticsQuery,
  validateDashboardRequest,
  validateStaffDashboardQuery
};
