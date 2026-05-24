const { DEPARTMENTS } = require("../constants/issueConstants");
const { isNonEmptyString, isValidEmail } = require("../utils/validation");

const ALLOWED_ROLES = ["student", "staff", "admin"];

/**
 * Validates the register request body.
 *
 * @param {import("express").Request} req Express request.
 * @returns {string|null}
 */
function validateRegister(req) {
  const body = req.body || {};
  const { name, email, password, role, department, registrationKey } = body;

  if (!isNonEmptyString(name)) {
    return "Name is required";
  }

  if (!isValidEmail(email)) {
    return "Please provide a valid email address";
  }

  if (typeof password !== "string" || password.length < 6) {
    return "Password must be at least 6 characters long";
  }

  if (role && !ALLOWED_ROLES.includes(role)) {
    return `Role must be one of: ${ALLOWED_ROLES.join(", ")}`;
  }

  if (department && !DEPARTMENTS.includes(department)) {
    return `Department must be one of: ${DEPARTMENTS.join(", ")}`;
  }

  if (role === "staff" && !department) {
    return "Department is required when registering a staff user";
  }

  if ((role === "admin" || role === "staff") && !isNonEmptyString(registrationKey)) {
    return "Registration key is required for administrative and staff accounts";
  }

  return null;
}

/**
 * Validates the login request body.
 *
 * @param {import("express").Request} req Express request.
 * @returns {string|null}
 */
function validateLogin(req) {
  const body = req.body || {};
  const { email, password } = body;

  if (!isValidEmail(email)) {
    return "Please provide a valid email address";
  }

  if (typeof password !== "string" || password.length === 0) {
    return "Password is required";
  }

  return null;
}

module.exports = {
  validateRegister,
  validateLogin
};
