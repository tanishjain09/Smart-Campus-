const {
  DEPARTMENTS,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES
} = require("../constants/issueConstants");
const {
  isNonEmptyString,
  isValidDateString,
  isValidObjectId,
  parseBoolean,
  parsePositiveInteger
} = require("../utils/validation");

/**
 * Validates the create-issue request body.
 *
 * @param {import("express").Request} req Express request.
 * @returns {string|null}
 */
function validateCreateIssue(req) {
  const body = req.body || {};
  const { title, description, category, location, assignedTo, priority, department } = body;

  if (!isNonEmptyString(title) || title.trim().length < 5) {
    return "Title must be at least 5 characters long";
  }

  if (!isNonEmptyString(description) || description.trim().length < 10) {
    return "Description must be at least 10 characters long";
  }

  if (!isNonEmptyString(category)) {
    return "Category is required";
  }

  if (!isNonEmptyString(location)) {
    return "Location is required";
  }

  if (priority && !ISSUE_PRIORITIES.includes(priority)) {
    return `Priority must be one of: ${ISSUE_PRIORITIES.join(", ")}`;
  }

  if (department && !DEPARTMENTS.includes(department)) {
    return `Department must be one of: ${DEPARTMENTS.join(", ")}`;
  }

  if (assignedTo && !isValidObjectId(assignedTo)) {
    return "assignedTo must be a valid user id";
  }

  return null;
}

/**
 * Validates supported issue list query parameters.
 *
 * @param {import("express").Request} req Express request.
 * @returns {string|null}
 */
function validateIssueFilters(req) {
  const {
    status,
    page,
    limit,
    priority,
    department,
    assignedTo,
    createdFrom,
    createdTo,
    escalated
  } = req.query;

  if (status && !ISSUE_STATUSES.includes(status)) {
    return `Status must be one of: ${ISSUE_STATUSES.join(", ")}`;
  }

  if (priority && !ISSUE_PRIORITIES.includes(priority)) {
    return `Priority must be one of: ${ISSUE_PRIORITIES.join(", ")}`;
  }

  if (department && !DEPARTMENTS.includes(department)) {
    return `Department must be one of: ${DEPARTMENTS.join(", ")}`;
  }

  if (assignedTo && !isValidObjectId(assignedTo)) {
    return "assignedTo must be a valid user id";
  }

  if (createdFrom && !isValidDateString(createdFrom)) {
    return "createdFrom must be a valid date";
  }

  if (createdTo && !isValidDateString(createdTo)) {
    return "createdTo must be a valid date";
  }

  if (createdFrom && createdTo && new Date(createdFrom) > new Date(createdTo)) {
    return "createdFrom must be earlier than or equal to createdTo";
  }

  if (page !== undefined && parsePositiveInteger(page, null) === null) {
    return "page must be a positive integer";
  }

  if (limit !== undefined && parsePositiveInteger(limit, null) === null) {
    return "limit must be a positive integer";
  }

  if (escalated !== undefined && !["true", "false"].includes(String(escalated))) {
    return "escalated must be true or false";
  }

  return null;
}

/**
 * Validates the ticket id route parameter.
 *
 * @param {import("express").Request} req Express request.
 * @returns {string|null}
 */
function validateTicketIdParam(req) {
  if (!isNonEmptyString(req.params.ticketId)) {
    return "ticketId is required";
  }

  return null;
}

/**
 * Validates the update-status request body.
 *
 * @param {import("express").Request} req Express request.
 * @returns {string|null}
 */
function validateIssueStatusUpdate(req) {
  const body = req.body || {};
  const { status, assignedTo } = body;

  if (!status || !ISSUE_STATUSES.includes(status)) {
    return `Status must be one of: ${ISSUE_STATUSES.join(", ")}`;
  }

  if (assignedTo && !isValidObjectId(assignedTo)) {
    return "assignedTo must be a valid user id";
  }

  return null;
}

/**
 * Validates the assign-issue request body.
 *
 * @param {import("express").Request} req Express request.
 * @returns {string|null}
 */
function validateIssueAssignment(req) {
  const body = req.body || {};

  if (!body.assignedTo || !isValidObjectId(body.assignedTo)) {
    return "assignedTo must be a valid user id";
  }

  return null;
}

/**
 * Validates escalation sweep query parameters.
 *
 * @param {import("express").Request} req Express request.
 * @returns {string|null}
 */
function validateEscalationSweep(req) {
  if (req.query.dryRun !== undefined && !["true", "false"].includes(String(req.query.dryRun))) {
    return "dryRun must be true or false";
  }

  return null;
}

module.exports = {
  validateCreateIssue,
  validateEscalationSweep,
  validateIssueFilters,
  validateTicketIdParam,
  validateIssueStatusUpdate,
  validateIssueAssignment
};
