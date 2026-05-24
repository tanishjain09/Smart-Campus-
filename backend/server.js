require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { startEscalationJob } = require("./jobs/escalationJob");
const logger = require("./utils/logger");
const mongoose = require("mongoose");

const PORT = Number(process.env.PORT) || 5000;

/**
 * Boots the application services and starts listening for HTTP traffic.
 *
 * @returns {Promise<void>}
 */
async function startServer() {
  await connectDB();
  startEscalationJob();

  const server = app.listen(PORT, () => {
    logger.info("Server started", { port: PORT });
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      logger.info("HTTP server closed");
      await mongoose.connection.close();
      logger.info("MongoDB connection closed");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((error) => {
  logger.error("Server startup failed", {
    error: error.message
  });
  process.exit(1);
});
