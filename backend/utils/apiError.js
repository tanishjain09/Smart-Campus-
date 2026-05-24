/**
 * Standard application error with an attached HTTP status code.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code to send to the client.
   * @param {string} message Human-readable error message.
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
