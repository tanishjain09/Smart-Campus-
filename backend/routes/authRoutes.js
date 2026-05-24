const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { validateRegister, validateLogin } = require("../validators/authValidators");

/**
 * Authentication routes for registration, login, and current-user lookup.
 */
const router = express.Router();

router.post("/register", validateRequest([validateRegister]), authController.register);
router.post("/login", validateRequest([validateLogin]), authController.login);
router.get("/me", protect, authController.getCurrentUser);

module.exports = router;
