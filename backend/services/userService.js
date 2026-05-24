const User = require("../model/User");

/**
 * Returns all users, optionally filtered by role or department.
 *
 * @param {Record<string, unknown>} query Query parameters.
 * @returns {Promise<object[]>}
 */
async function listUsers(query) {
  const filter = {};

  if (query.role) {
    filter.role = query.role;
  }

  if (query.department) {
    filter.department = query.department;
  }

  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 });

  return users;
}

module.exports = { listUsers };
