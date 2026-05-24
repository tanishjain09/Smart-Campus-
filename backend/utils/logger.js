/**
 * Emits a structured log entry to stdout/stderr.
 *
 * @param {"info"|"warn"|"error"} level Log level.
 * @param {string} message Primary log message.
 * @param {Record<string, unknown>} [metadata={}] Additional structured fields.
 * @returns {void}
 */
function log(level, message, metadata = {}) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...metadata
  };

  const serializedEntry = JSON.stringify(entry);

  if (level === "error") {
    console.error(serializedEntry);
    return;
  }

  console.log(serializedEntry);
}

module.exports = {
  /**
   * Logs an application error event.
   *
   * @param {string} message Error message.
   * @param {Record<string, unknown>} [metadata] Structured metadata payload.
   * @returns {void}
   */
  error(message, metadata) {
    log("error", message, metadata);
  },
  /**
   * Logs an informational event.
   *
   * @param {string} message Log message.
   * @param {Record<string, unknown>} [metadata] Structured metadata payload.
   * @returns {void}
   */
  info(message, metadata) {
    log("info", message, metadata);
  },
  /**
   * Logs a warning event.
   *
   * @param {string} message Log message.
   * @param {Record<string, unknown>} [metadata] Structured metadata payload.
   * @returns {void}
   */
  warn(message, metadata) {
    log("warn", message, metadata);
  }
};
