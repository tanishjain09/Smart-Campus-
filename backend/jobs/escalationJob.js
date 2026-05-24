const cron = require("node-cron");
const issueService = require("../services/issueService");
const logger = require("../utils/logger");

/**
 * Starts the scheduled escalation sweep job.
 *
 * @returns {import("node-cron").ScheduledTask|null}
 */
function startEscalationJob() {
  const schedule = process.env.ESCALATION_CRON || "0 * * * *";

  if (process.env.DISABLE_ESCALATION_JOB === "true") {
    logger.warn("Escalation job is disabled via environment variable");
    return null;
  }

  const task = cron.schedule(schedule, async () => {
    try {
      const result = await issueService.escalateOverdueIssues();
      logger.info("Escalation job completed", {
        processed: result.processed
      });
    } catch (error) {
      logger.error("Escalation job failed", {
        error: error.message
      });
    }
  });

  logger.info("Escalation job scheduled", { schedule });
  return task;
}

module.exports = {
  startEscalationJob
};
