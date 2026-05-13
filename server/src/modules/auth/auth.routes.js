const express = require("express");
const authController = require("./auth.controller");
const { validateRegister, validateLogin } = require("./auth.validation");
const { protect } = require("../../middleware/auth");

const router = express.Router();

// Public routes — no auth required
router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/refresh", authController.refresh);

// Protected routes — auth required
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);

module.exports = router;
