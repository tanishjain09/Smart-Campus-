const test = require("node:test");
const assert = require("node:assert/strict");
const {
  canTransitionIssueStatus,
  validateIssueStatusTransition
} = require("../utils/issueStateMachine");

test("allows valid issue state transitions", () => {
  assert.equal(canTransitionIssueStatus("reported", "assigned"), true);
  assert.equal(canTransitionIssueStatus("assigned", "in_progress"), true);
  assert.equal(canTransitionIssueStatus("in_progress", "resolved"), true);
});

test("blocks invalid issue state transitions", () => {
  assert.equal(canTransitionIssueStatus("reported", "in_progress"), false);
  assert.equal(canTransitionIssueStatus("resolved", "reported"), false);
});

test("returns descriptive validation errors for invalid transitions", () => {
  assert.equal(
    validateIssueStatusTransition("reported", "in_progress"),
    "Cannot transition issue from reported to in_progress"
  );
  assert.equal(validateIssueStatusTransition("assigned", "resolved"), null);
});
