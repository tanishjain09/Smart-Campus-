const test = require("node:test");
const assert = require("node:assert/strict");
const { validateRegister, validateLogin } = require("../validators/authValidators");
const { validateCreateIssue, validateIssueStatusUpdate } = require("../validators/issueValidators");

test("register validator accepts valid payload", () => {
  const error = validateRegister({
    body: {
      name: "Aman",
      email: "aman@example.com",
      password: "secure123",
      role: "student"
    }
  });

  assert.equal(error, null);
});

test("register validator rejects invalid payload", () => {
  const error = validateRegister({
    body: {
      name: "",
      email: "bad-email",
      password: "123"
    }
  });

  assert.equal(error, "Name is required");
});

test("login validator requires password", () => {
  const error = validateLogin({
    body: {
      email: "aman@example.com",
      password: ""
    }
  });

  assert.equal(error, "Password is required");
});

test("issue validators reject short description and invalid status", () => {
  const createError = validateCreateIssue({
    body: {
      title: "Water leak",
      description: "short",
      category: "plumbing",
      location: "Block A"
    }
  });

  const statusError = validateIssueStatusUpdate({
    body: {
      status: "closed"
    }
  });

  assert.equal(createError, "Description must be at least 10 characters long");
  assert.equal(statusError, "Status must be one of: reported, assigned, in_progress, resolved");
});

test("register validator requires registrationKey for admin and staff roles", () => {
  const adminErrorMissing = validateRegister({
    body: {
      name: "Admin User",
      email: "admin@example.com",
      password: "secure123",
      role: "admin"
    }
  });

  const staffErrorMissing = validateRegister({
    body: {
      name: "Staff User",
      email: "staff@example.com",
      password: "secure123",
      role: "staff",
      department: "electrical"
    }
  });

  const adminSuccess = validateRegister({
    body: {
      name: "Admin User",
      email: "admin@example.com",
      password: "secure123",
      role: "admin",
      registrationKey: "anykey"
    }
  });

  assert.equal(adminErrorMissing, "Registration key is required for administrative and staff accounts");
  assert.equal(staffErrorMissing, "Registration key is required for administrative and staff accounts");
  assert.equal(adminSuccess, null);
});
