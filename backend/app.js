const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { buildCorsOptions, preventHttpParameterPollution, securityHeaders } = require("./config/security");
const authRoutes = require("./routes/authRoutes");
const { protect } = require("./middleware/authMiddleware");
const authController = require("./controllers/authController");
const dashboardRoutes = require("./routes/dashboardRoutes");
const issueRoutes = require("./routes/issueRoutes");
const userRoutes = require("./routes/userRoutes");
const { createRateLimiter } = require("./middleware/rateLimiter");
const attachRequestContext = require("./middleware/requestContext");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const logger = require("./utils/logger");

/**
 * Express application configured with security, logging, parsers, routes, and
 * error handling.
 */
const app = express();
const corsOptions = buildCorsOptions();
const generalLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 300 });
const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 30 });

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(attachRequestContext);
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(preventHttpParameterPollution);
app.use(generalLimiter);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan("combined", {
  stream: {
    write(message) {
      logger.info("HTTP request", { message: message.trim() });
    }
  }
}));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Service is healthy",
    timestamp: req.requestTime
  });
});

app.get("/api/v1", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Campus API is running",
    timestamp: req.requestTime
  });
});

app.get("/api/v1/auth/me", protect, authController.getCurrentUser);
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/issues", issueRoutes);
app.use("/api/v1/users", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
