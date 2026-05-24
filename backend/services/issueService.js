const mongoose = require("mongoose");
const Issue = require("../model/Issue");
const User = require("../model/User");
const ApiError = require("../utils/apiError");
const {
  DEPARTMENTS,
  ISSUE_PRIORITIES,
  getEscalatedPriority,
  resolveDepartmentFromCategory
} = require("../constants/issueConstants");
const {
  validateIssueStatusTransition
} = require("../utils/issueStateMachine");
const {
  parseBoolean,
  parsePositiveInteger
} = require("../utils/validation");

const ASSIGNABLE_ROLES = ["staff", "admin"];
const POPULATE_USER_FIELDS = "name email role department";

/**
 * Normalizes pagination parameters from query strings.
 *
 * @param {Record<string, unknown>} query Request query object.
 * @returns {{page: number, limit: number, skip: number}}
 */
function normalizePagination(query) {
  const page = parsePositiveInteger(query.page, 1);
  const limit = Math.min(parsePositiveInteger(query.limit, 10), 100);
  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Builds a MongoDB date range filter for issue creation timestamps.
 *
 * @param {Record<string, unknown>} query Request query object.
 * @returns {object|null}
 */
function buildDateRangeFilter(query) {
  const createdAt = {};

  if (query.createdFrom) {
    createdAt.$gte = new Date(query.createdFrom);
  }

  if (query.createdTo) {
    createdAt.$lte = new Date(query.createdTo);
  }

  return Object.keys(createdAt).length > 0 ? createdAt : null;
}

/**
 * Maps an uploaded file into the attachment format stored on issues.
 *
 * @param {Express.Multer.File|undefined} file Uploaded file metadata.
 * @returns {Array<object>}
 */
function buildAttachmentPayload(file) {
  if (!file) {
    return [];
  }

  return [{
    url: file.path || file.secure_url,
    publicId: file.filename || file.public_id,
    originalName: file.originalname || file.original_filename,
    format: file.format || file.mimetype,
    bytes: file.size || file.bytes
  }];
}

/**
 * Ensures that an assignee exists and is eligible for the issue department.
 *
 * @param {string} userId Candidate assignee id.
 * @param {string} department Target department.
 * @returns {Promise<import("../model/User")>}
 */
async function validateAssignableUser(userId, department) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "assignedTo must be a valid user id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "Assigned user not found");
  }

  if (!ASSIGNABLE_ROLES.includes(user.role)) {
    throw new ApiError(400, "Issues can only be assigned to staff or admin users");
  }

  if (department && user.role === "staff" && user.department !== department) {
    throw new ApiError(400, `Assigned staff user must belong to the ${department} department`);
  }

  return user;
}

/**
 * Builds the MongoDB filter used by the issue listing endpoints.
 *
 * @param {Record<string, unknown>} query Request query object.
 * @param {import("../model/User")} currentUser Authenticated user.
 * @returns {object}
 */
function buildIssueFilters(query, currentUser) {
  const filter = {};
  const createdAt = buildDateRangeFilter(query);

  if (query.status) {
    filter.status = query.status;
  }

  if (query.category) {
    filter.category = String(query.category).trim();
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.department) {
    filter.department = query.department;
  }

  if (query.assignedTo) {
    filter.assignedTo = query.assignedTo;
  }

  if (createdAt) {
    filter.createdAt = createdAt;
  }

  if (query.escalated !== undefined) {
    filter.escalationLevel = parseBoolean(query.escalated) ? { $gt: 0 } : 0;
  }

  if (query.search) {
    filter.$text = { $search: String(query.search).trim() };
  }

  if (currentUser.role === "student") {
    filter.createdBy = currentUser._id;
  }

  return filter;
}

/**
 * Populates the user references on an issue query or document.
 *
 * @param {object|null} issueQuery Mongoose query or hydrated document.
 * @returns {Promise<object|null>}
 */
async function populateIssue(issueQuery) {
  if (!issueQuery) {
    return issueQuery;
  }

  if (typeof issueQuery.exec === "function") {
    return issueQuery
      .populate("createdBy", POPULATE_USER_FIELDS)
      .populate("assignedTo", POPULATE_USER_FIELDS);
  }

  return issueQuery.populate([
    { path: "createdBy", select: POPULATE_USER_FIELDS },
    { path: "assignedTo", select: POPULATE_USER_FIELDS }
  ]);
}

/**
 * Creates a new issue, optionally with an uploaded attachment and assignee.
 *
 * @param {Record<string, unknown>} payload Issue creation payload.
 * @param {import("../model/User")} currentUser Authenticated user.
 * @param {Express.Multer.File|undefined} file Uploaded image metadata.
 * @returns {Promise<import("../model/Issue")>}
 */
async function createIssue(payload, currentUser, file) {
  const { title, description, category, location, assignedTo, priority, department } = payload;
  const normalizedPriority = priority || "medium";

  if (!title || !description || !category || !location) {
    throw new ApiError(400, "Title, description, category, and location are required");
  }

  if (!ISSUE_PRIORITIES.includes(normalizedPriority)) {
    throw new ApiError(400, `Priority must be one of: ${ISSUE_PRIORITIES.join(", ")}`);
  }

  const resolvedDepartment = department || resolveDepartmentFromCategory(category);

  if (!DEPARTMENTS.includes(resolvedDepartment)) {
    throw new ApiError(400, `Department must be one of: ${DEPARTMENTS.join(", ")}`);
  }

  const issuePayload = {
    title: String(title).trim(),
    description: String(description).trim(),
    category: String(category).trim(),
    location: String(location).trim(),
    priority: normalizedPriority,
    department: resolvedDepartment,
    createdBy: currentUser._id,
    attachments: buildAttachmentPayload(file)
  };

  if (assignedTo) {
    if (!ASSIGNABLE_ROLES.includes(currentUser.role)) {
      throw new ApiError(403, "You are not allowed to assign issues during creation");
    }

    await validateAssignableUser(assignedTo, resolvedDepartment);
    issuePayload.assignedTo = assignedTo;
    issuePayload.status = "assigned";
  }

  const issue = await Issue.create(issuePayload);
  await populateIssue(issue);

  return issue;
}

/**
 * Returns a paginated list of issues visible to the current user.
 *
 * @param {Record<string, unknown>} query Request query object.
 * @param {import("../model/User")} currentUser Authenticated user.
 * @returns {Promise<object>}
 */
async function listIssues(query, currentUser) {
  const { page, limit, skip } = normalizePagination(query);
  const filter = buildIssueFilters(query, currentUser);
  const sort = query.sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  const [issues, total] = await Promise.all([
    populateIssue(
      Issue.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
    ),
    Issue.countDocuments(filter)
  ]);

  return {
    issues,
    filters: {
      status: query.status || null,
      priority: query.priority || null,
      department: query.department || null,
      category: query.category || null,
      assignedTo: query.assignedTo || null,
      escalated: query.escalated !== undefined ? parseBoolean(query.escalated) : null
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Returns a single issue by ticket id with authorization enforcement.
 *
 * @param {string} ticketId Public ticket identifier.
 * @param {import("../model/User")} currentUser Authenticated user.
 * @returns {Promise<import("../model/Issue")>}
 */
async function getIssueByTicketId(ticketId, currentUser) {
  const issue = await populateIssue(Issue.findOne({ ticketId }));

  if (!issue) {
    throw new ApiError(404, "Issue not found");
  }

  if (currentUser.role === "student" && issue.createdBy._id.toString() !== currentUser._id.toString()) {
    throw new ApiError(403, "You are not allowed to access this issue");
  }

  return issue;
}

/**
 * Updates an issue status and optional assignee.
 *
 * @param {string} ticketId Public ticket identifier.
 * @param {{status: string, assignedTo?: string}} payload Status update payload.
 * @returns {Promise<import("../model/Issue")>}
 */
async function updateIssueStatus(ticketId, payload) {
  const { status, assignedTo } = payload;
  const issue = await Issue.findOne({ ticketId });

  if (!issue) {
    throw new ApiError(404, "Issue not found");
  }

  const transitionError = validateIssueStatusTransition(issue.status, status);

  if (transitionError) {
    throw new ApiError(400, transitionError);
  }

  if (assignedTo) {
    await validateAssignableUser(assignedTo, issue.department);
    issue.assignedTo = assignedTo;
  }

  if (status === "assigned" && !issue.assignedTo && !assignedTo) {
    throw new ApiError(400, "assignedTo is required before an issue can be marked as assigned");
  }

  if (status === "in_progress" && !issue.assignedTo) {
    throw new ApiError(400, "An issue must be assigned before work can start");
  }

  issue.status = status;
  await issue.save();
  await populateIssue(issue);

  return issue;
}

/**
 * Assigns an issue to an eligible staff or admin user.
 *
 * @param {string} ticketId Public ticket identifier.
 * @param {string} assignedTo Assignee user id.
 * @param {import("../model/User")} currentUser Authenticated user.
 * @returns {Promise<import("../model/Issue")>}
 */
async function assignIssue(ticketId, assignedTo, currentUser) {
  if (!assignedTo) {
    throw new ApiError(400, "assignedTo must be provided");
  }

  if (!ASSIGNABLE_ROLES.includes(currentUser.role)) {
    throw new ApiError(403, "You are not allowed to assign issues");
  }

  const issue = await Issue.findOne({ ticketId });

  if (!issue) {
    throw new ApiError(404, "Issue not found");
  }

  await validateAssignableUser(assignedTo, issue.department);
  issue.assignedTo = assignedTo;
  issue.status = "assigned";
  await issue.save();
  await populateIssue(issue);

  return issue;
}

/**
 * Returns the current staff member's assigned issue list.
 *
 * @param {import("../model/User")} currentUser Authenticated user.
 * @param {Record<string, unknown>} query Request query object.
 * @returns {Promise<object>}
 */
async function getAssignedIssues(currentUser, query) {
  if (!ASSIGNABLE_ROLES.includes(currentUser.role)) {
    throw new ApiError(403, "You are not authorized to view assigned issues");
  }

  const normalizedQuery = {
    ...query,
    assignedTo: currentUser._id.toString()
  };

  if (currentUser.role === "staff") {
    normalizedQuery.department = currentUser.department;
  }

  return listIssues(normalizedQuery, { ...currentUser.toObject(), role: "admin" });
}

/**
 * Escalates overdue unresolved issues and bumps their deadlines.
 *
 * @param {{dryRun?: boolean}} [options={}] Escalation run options.
 * @returns {Promise<{processed: number, updatedIssues: object[]}>}
 */
async function escalateOverdueIssues(options = {}) {
  const now = new Date();
  const filter = {
    status: { $ne: "resolved" },
    escalationDeadline: { $lte: now }
  };
  const issues = await Issue.find(filter);
  const dryRun = Boolean(options.dryRun);
  const updatedIssues = [];

  for (const issue of issues) {
    const priorityBefore = issue.priority;
    const nextPriority = getEscalatedPriority(issue.priority);
    const nextDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    if (!dryRun) {
      issue.priority = nextPriority;
      issue.escalationLevel += 1;
      issue.escalatedAt = now;
      issue.escalationDeadline = nextDeadline;
      await issue.save();
    }

    updatedIssues.push({
      ticketId: issue.ticketId,
      priorityBefore,
      priorityAfter: nextPriority,
      escalationLevel: issue.escalationLevel + (dryRun ? 1 : 0),
      nextDeadline
    });
  }

  return {
    processed: issues.length,
    updatedIssues
  };
}

module.exports = {
  ISSUE_PRIORITIES,
  assignIssue,
  createIssue,
  escalateOverdueIssues,
  getAssignedIssues,
  getIssueByTicketId,
  listIssues,
  updateIssueStatus
};
