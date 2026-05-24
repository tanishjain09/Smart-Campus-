const { ISSUE_STATUSES: VALID_ISSUE_STATUSES } = require("../constants/issueConstants");

const ALLOWED_TRANSITIONS = {
  reported: ["assigned", "resolved"],
  assigned: ["in_progress", "resolved"],
  in_progress: ["resolved"],
  resolved: []
};

/**
 * Checks whether an issue status transition is allowed.
 *
 * @param {string} currentStatus Current stored issue status.
 * @param {string} nextStatus Requested next issue status.
 * @returns {boolean}
 */
function canTransitionIssueStatus(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) {
    return true;
  }

  const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowedNextStatuses.includes(nextStatus);
}

/**
 * Validates an issue status transition and returns a human-readable error
 * message when it is invalid.
 *
 * @param {string} currentStatus Current stored issue status.
 * @param {string} nextStatus Requested next issue status.
 * @returns {string|null}
 */
function validateIssueStatusTransition(currentStatus, nextStatus) {
  if (!VALID_ISSUE_STATUSES.includes(nextStatus)) {
    return `Status must be one of: ${VALID_ISSUE_STATUSES.join(", ")}`;
  }

  if (!VALID_ISSUE_STATUSES.includes(currentStatus)) {
    return `Current status is invalid: ${currentStatus}`;
  }

  if (!canTransitionIssueStatus(currentStatus, nextStatus)) {
    return `Cannot transition issue from ${currentStatus} to ${nextStatus}`;
  }

  return null;
}

module.exports = {
  VALID_ISSUE_STATUSES,
  canTransitionIssueStatus,
  validateIssueStatusTransition
};
