const express = require("express");
const issueController = require("../controllers/issueController");
const upload = require("../config/multer");
const { protect, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  validateCreateIssue,
  validateEscalationSweep,
  validateIssueFilters,
  validateTicketIdParam,
  validateIssueStatusUpdate,
  validateIssueAssignment
} = require("../validators/issueValidators");

/**
 * Issue management routes for creation, filtering, assignment, and escalation.
 */
const router = express.Router();

router.use(protect);

router.get("/", validateRequest([validateIssueFilters]), issueController.listIssues);
router.get(
  "/assigned/me",
  authorize("staff", "admin"),
  validateRequest([validateIssueFilters]),
  issueController.getAssignedIssues
);
router.post(
  "/",
  upload.single("image"),
  validateRequest([validateCreateIssue]),
  issueController.createIssue
);
router.post(
  "/escalations/run",
  authorize("admin"),
  validateRequest([validateEscalationSweep]),
  issueController.runEscalationSweep
);
router.get("/:ticketId", validateRequest([validateTicketIdParam]), issueController.getIssueByTicketId);
router.patch(
  "/:ticketId/status",
  authorize("staff", "admin"),
  validateRequest([validateTicketIdParam, validateIssueStatusUpdate]),
  issueController.updateIssueStatus
);
router.patch(
  "/:ticketId/assign",
  authorize("staff", "admin"),
  validateRequest([validateTicketIdParam, validateIssueAssignment]),
  issueController.assignIssue
);

module.exports = router;
