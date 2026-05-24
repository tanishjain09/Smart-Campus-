const asyncHandler = require("../utils/asyncHandler");
const issueService = require("../services/issueService");

/**
 * Creates a new issue from JSON or multipart form-data input.
 */
exports.createIssue = asyncHandler(async (req, res) => {
  const issue = await issueService.createIssue(req.body, req.user, req.file);

  return res.status(201).json({
    success: true,
    message: "Issue created successfully",
    data: { issue }
  });
});

/**
 * Returns the issue list for the current user.
 */
exports.listIssues = asyncHandler(async (req, res) => {
  const data = await issueService.listIssues(req.query, req.user);

  return res.status(200).json({
    success: true,
    message: "Issues fetched successfully",
    data
  });
});

/**
 * Returns a single issue by ticket id.
 */
exports.getIssueByTicketId = asyncHandler(async (req, res) => {
  const issue = await issueService.getIssueByTicketId(req.params.ticketId, req.user);

  return res.status(200).json({
    success: true,
    message: "Issue fetched successfully",
    data: { issue }
  });
});

/**
 * Updates the lifecycle status of an existing issue.
 */
exports.updateIssueStatus = asyncHandler(async (req, res) => {
  const issue = await issueService.updateIssueStatus(req.params.ticketId, req.body);

  return res.status(200).json({
    success: true,
    message: "Issue updated successfully",
    data: { issue }
  });
});

/**
 * Assigns an issue to a staff or admin user.
 */
exports.assignIssue = asyncHandler(async (req, res) => {
  const issue = await issueService.assignIssue(req.params.ticketId, req.body.assignedTo, req.user);

  return res.status(200).json({
    success: true,
    message: "Issue assigned successfully",
    data: { issue }
  });
});

/**
 * Returns issues assigned to the current staff/admin user.
 */
exports.getAssignedIssues = asyncHandler(async (req, res) => {
  const data = await issueService.getAssignedIssues(req.user, req.query);

  return res.status(200).json({
    success: true,
    message: "Assigned issues fetched successfully",
    data
  });
});

/**
 * Runs the overdue issue escalation sweep.
 */
exports.runEscalationSweep = asyncHandler(async (req, res) => {
  const data = await issueService.escalateOverdueIssues({
    dryRun: req.query.dryRun === "true"
  });

  return res.status(200).json({
    success: true,
    message: "Escalation sweep completed successfully",
    data
  });
});
