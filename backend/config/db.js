const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * Connects the application to MongoDB using the configured connection string.
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("MongoDB connection failed", {
      error: error.message
    });
    throw error;
  }
};

module.exports = connectDB;
