/**
 * Supported issue priorities in ascending severity order.
 */
const ISSUE_PRIORITIES = ["low", "medium", "high", "critical"];
/**
 * Valid issue lifecycle states.
 */
const ISSUE_STATUSES = ["reported", "assigned", "in_progress", "resolved"];
/**
 * Supported campus departments.
 */
const DEPARTMENTS = [
  "administration",
  "electrical",
  "it",
  "hostel",
  "maintenance",
  "library",
  "transport",
  "security",
  "academics"
];

/**
 * Maps normalized categories to the department that should own the issue.
 */
const CATEGORY_DEPARTMENT_MAP = {
  wifi: "it",
  internet: "it",
  software: "it",
  projector: "it",
  website: "it",
  electricity: "electrical",
  power: "electrical",
  light: "electrical",
  fan: "electrical",
  plumbing: "maintenance",
  furniture: "maintenance",
  classroom: "maintenance",
  washroom: "maintenance",
  hostel: "hostel",
  mess: "hostel",
  room: "hostel",
  book: "library",
  library: "library",
  bus: "transport",
  transport: "transport",
  parking: "security",
  gate: "security",
  id_card: "administration",
  fee: "administration",
  scholarship: "administration",
  exam: "academics",
  timetable: "academics",
  faculty: "academics"
};

/**
 * Numeric ranking used for escalation and sorting decisions.
 */
const PRIORITY_RANK = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3
};

/**
 * Normalizes free-form category input into the map key format.
 *
 * @param {unknown} value Raw category input.
 * @returns {string}
 */
function normalizeCategory(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

/**
 * Resolves the owning department for an issue category.
 *
 * @param {string} category Issue category.
 * @param {string} [fallbackDepartment="administration"] Fallback department.
 * @returns {string}
 */
function resolveDepartmentFromCategory(category, fallbackDepartment = "administration") {
  const normalizedCategory = normalizeCategory(category);
  return CATEGORY_DEPARTMENT_MAP[normalizedCategory] || fallbackDepartment;
}

/**
 * Returns the next escalation priority without exceeding the maximum.
 *
 * @param {string} priority Current issue priority.
 * @returns {string}
 */
function getEscalatedPriority(priority) {
  const priorities = ISSUE_PRIORITIES;
  const nextIndex = Math.min(PRIORITY_RANK[priority] + 1, priorities.length - 1);
  return priorities[nextIndex];
}

module.exports = {
  CATEGORY_DEPARTMENT_MAP,
  DEPARTMENTS,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  PRIORITY_RANK,
  getEscalatedPriority,
  normalizeCategory,
  resolveDepartmentFromCategory
};
