const mongoose = require("mongoose");

/**
 * Checks whether a value is a non-empty string after trimming.
 *
 * @param {unknown} value Value to test.
 * @returns {boolean}
 */
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates a basic email address shape.
 *
 * @param {unknown} value Value to test.
 * @returns {boolean}
 */
function isValidEmail(value) {
  return isNonEmptyString(value) && /^\S+@\S+\.\S+$/.test(value.trim());
}

/**
 * Checks whether a value can be used as a valid MongoDB ObjectId.
 *
 * @param {unknown} value Value to test.
 * @returns {boolean}
 */
function isValidObjectId(value) {
  return typeof value === "string" && mongoose.Types.ObjectId.isValid(value);
}

/**
 * Parses a positive integer from user input or returns a fallback.
 *
 * @param {unknown} value Input value to parse.
 * @param {number|null} fallback Value returned when parsing fails.
 * @returns {number|null}
 */
function parsePositiveInteger(value, fallback) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}

/**
 * Parses a string or boolean into a boolean value.
 *
 * @param {unknown} value Value to parse.
 * @param {boolean} [fallback=false] Fallback when parsing fails.
 * @returns {boolean}
 */
function parseBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
}

/**
 * Checks whether a value can be parsed into a valid date.
 *
 * @param {unknown} value Value to validate.
 * @returns {boolean}
 */
function isValidDateString(value) {
  if (!isNonEmptyString(value)) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

module.exports = {
  isNonEmptyString,
  isValidEmail,
  isValidObjectId,
  parseBoolean,
  parsePositiveInteger,
  isValidDateString
};
