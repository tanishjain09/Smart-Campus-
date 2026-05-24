const express = require("express");
const userController = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * User management routes (admin only).
 */
const router = express.Router();

router.use(protect);
router.get("/", authorize("admin"), userController.listUsers);

module.exports = router;
