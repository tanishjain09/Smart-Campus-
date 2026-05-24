const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const { DEPARTMENTS } = require("../constants/issueConstants");
const ApiError = require("../utils/apiError");
const { isNonEmptyString } = require("../utils/validation");

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const ALLOWED_ROLES = ["student", "staff", "admin"];

/**
 * Converts a user document into the API-safe user payload.
 *
 * @param {import("../model/User")} user User document.
 * @returns {{id: *, name: *, email: *, role: *, department: *, createdAt: *, updatedAt: *}}
 */
function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

/**
 * Signs a JWT access token for the supplied user.
 *
 * @param {import("../model/User")} user User document.
 * @returns {string}
 */
function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Registers a new user and returns the sanitized user plus token.
 *
 * @param {{name: string, email: string, password: string, role?: string, department?: string}} payload Registration payload.
 * @returns {Promise<{user: object, token: string}>}
 */
async function registerUser(payload) {
  const { name, email, password, role, department, registrationKey } = payload;
  const normalizedEmail = String(email).trim().toLowerCase();
  const trimmedName = String(name).trim();
  const normalizedRole = role || "student";
  const normalizedDepartment = department || "administration";

  if (!isNonEmptyString(trimmedName)) {
    throw new ApiError(400, "Name is required");
  }

  if (!ALLOWED_ROLES.includes(normalizedRole)) {
    throw new ApiError(400, `Role must be one of: ${ALLOWED_ROLES.join(", ")}`);
  }

  if (!DEPARTMENTS.includes(normalizedDepartment)) {
    throw new ApiError(400, `Department must be one of: ${DEPARTMENTS.join(", ")}`);
  }

  if (normalizedRole === "staff" && !department) {
    throw new ApiError(400, "Department is required when registering a staff user");
  }

  // Validate registration key for privileged roles
  if (normalizedRole === "admin") {
    const adminSecret = process.env.ADMIN_REGISTRATION_KEY || "admin123";
    if (registrationKey !== adminSecret) {
      throw new ApiError(401, "Invalid registration key for Administrator role");
    }
  }

  if (normalizedRole === "staff") {
    const staffSecret = process.env.STAFF_REGISTRATION_KEY || "staff123";
    if (registrationKey !== staffSecret) {
      throw new ApiError(401, "Invalid registration key for Staff Member role");
    }
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  let user;
  try {
    user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      department: normalizedDepartment
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "A user with this email already exists");
    }

    throw error;
  }

  return {
    user: sanitizeUser(user),
    token: signToken(user)
  };
}

/**
 * Authenticates a user by email and password.
 *
 * @param {{email: string, password: string}} payload Login payload.
 * @returns {Promise<{user: object, token: string}>}
 */
async function loginUser(payload) {
  const { email, password } = payload;
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  return {
    user: sanitizeUser(user),
    token: signToken(user)
  };
}

/**
 * Resolves the current user from a bearer token.
 *
 * @param {string} token JWT bearer token.
 * @returns {Promise<import("../model/User")>}
 */
async function getUserFromToken(token) {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired authentication token");
  }

  const user = await User.findById(decoded.sub);

  if (!user) {
    throw new ApiError(401, "User associated with this token no longer exists");
  }

  return user;
}

/**
 * Returns the API-safe representation of the authenticated user.
 *
 * @param {import("../model/User")} user User document.
 * @returns {object}
 */
function getCurrentUser(user) {
  return sanitizeUser(user);
}

module.exports = {
  getCurrentUser,
  getUserFromToken,
  loginUser,
  registerUser,
  sanitizeUser
};
