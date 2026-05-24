const mongoose = require("mongoose");
const logger = require("../utils/logger");

let isConnected = false;

/**
 * Connects the application to MongoDB using the configured connection string.
 * Supports serverless connection caching.
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("MongoDB connection failed", {
      error: error.message
    });
    throw error;
  }
};

module.exports = connectDB;
