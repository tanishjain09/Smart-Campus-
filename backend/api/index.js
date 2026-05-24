require("dotenv").config();
const app = require("../app");
const connectDB = require("../config/db");

// Vercel serverless function entrypoint
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed in serverless handler",
      error: error.message
    });
  }
};
