const Issue = require("../model/Issue");
const ApiError = require("../utils/apiError");
const { parsePositiveInteger } = require("../utils/validation");

/**
 * Builds the issue visibility scope for dashboard consumers.
 *
 * @param {import("../model/User")} currentUser Authenticated user.
 * @returns {object}
 */
function getIssueScope(currentUser) {
  if (currentUser.role === "student") {
    return { createdBy: currentUser._id };
  }

  if (currentUser.role === "staff") {
    return {
      $or: [
        { assignedTo: currentUser._id },
        { department: currentUser.department }
      ]
    };
  }

  return {};
}

/**
 * Returns the summary dashboard for the current user.
 *
 * @param {import("../model/User")} currentUser Authenticated user.
 * @returns {Promise<object>}
 */
async function getDashboardSummary(currentUser) {
  const issueScope = getIssueScope(currentUser);

  const [statusCounts, recentIssues, totalIssues, overdueCount] = await Promise.all([
    Issue.aggregate([
      { $match: issueScope },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    Issue.find(issueScope)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("createdBy", "name email role department")
      .populate("assignedTo", "name email role department"),
    Issue.countDocuments(issueScope),
    Issue.countDocuments({
      ...issueScope,
      status: { $ne: "resolved" },
      escalationDeadline: { $lt: new Date() }
    })
  ]);

  const countsByStatus = {
    reported: 0,
    assigned: 0,
    in_progress: 0,
    resolved: 0
  };

  statusCounts.forEach((entry) => {
    countsByStatus[entry._id] = entry.count;
  });

  return {
    user: {
      id: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      department: currentUser.department
    },
    issueSummary: {
      total: totalIssues,
      overdue: overdueCount,
      byStatus: countsByStatus
    },
    recentIssues
  };
}

/**
 * Returns assigned issue metrics for staff and admins.
 *
 * @param {import("../model/User")} currentUser Authenticated user.
 * @param {{page?: string|number, limit?: string|number}} query Pagination query parameters.
 * @returns {Promise<object>}
 */
async function getStaffDashboard(currentUser, query) {
  if (!["staff", "admin"].includes(currentUser.role)) {
    throw new ApiError(403, "You are not authorized to access staff dashboard data");
  }

  const page = parsePositiveInteger(query.page, 1);
  const limit = Math.min(parsePositiveInteger(query.limit, 10), 100);
  const skip = (page - 1) * limit;
  const baseFilter = currentUser.role === "staff"
    ? { assignedTo: currentUser._id }
    : {};

  const [assignedIssues, totalAssigned, statusCounts] = await Promise.all([
    Issue.find(baseFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email role department")
      .populate("assignedTo", "name email role department"),
    Issue.countDocuments(baseFilter),
    Issue.aggregate([
      { $match: baseFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ])
  ]);

  return {
    assignedIssues,
    statusCounts,
    pagination: {
      page,
      limit,
      total: totalAssigned,
      totalPages: Math.ceil(totalAssigned / limit)
    }
  };
}

/**
 * Builds analytics aggregates for staff or admin consumers.
 *
 * @param {import("../model/User")} currentUser Authenticated user.
 * @param {{days?: string|number}} query Analytics query parameters.
 * @returns {Promise<object>}
 */
async function getAnalytics(currentUser, query) {
  if (!["staff", "admin"].includes(currentUser.role)) {
    throw new ApiError(403, "You are not authorized to access analytics");
  }

  const days = Math.min(parsePositiveInteger(query.days, 30), 365);
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const scope = currentUser.role === "staff"
    ? { department: currentUser.department }
    : {};

  const [
    statusBreakdown,
    priorityBreakdown,
    departmentBreakdown,
    trend,
    overdueCount,
    escalatedCount,
    resolutionTime
  ] = await Promise.all([
    Issue.aggregate([
      { $match: scope },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    Issue.aggregate([
      { $match: scope },
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]),
    Issue.aggregate([
      { $match: scope },
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]),
    Issue.aggregate([
      { $match: { ...scope, createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]),
    Issue.countDocuments({
      ...scope,
      status: { $ne: "resolved" },
      escalationDeadline: { $lt: new Date() }
    }),
    Issue.countDocuments({
      ...scope,
      escalationLevel: { $gt: 0 }
    }),
    Issue.aggregate([
      {
        $match: {
          ...scope,
          status: "resolved",
          resolvedAt: { $ne: null }
        }
      },
      {
        $project: {
          resolutionHours: {
            $divide: [
              { $subtract: ["$resolvedAt", "$createdAt"] },
              1000 * 60 * 60
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionHours: { $avg: "$resolutionHours" }
        }
      }
    ])
  ]);

  return {
    days,
    overdueCount,
    escalatedCount,
    averageResolutionHours: resolutionTime[0]?.avgResolutionHours || 0,
    breakdowns: {
      status: statusBreakdown,
      priority: priorityBreakdown,
      department: departmentBreakdown
    },
    trend
  };
}

module.exports = {
  getAnalytics,
  getDashboardSummary,
  getStaffDashboard
};
