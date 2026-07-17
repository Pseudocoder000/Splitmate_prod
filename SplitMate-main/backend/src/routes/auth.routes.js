const express = require("express");

const authController = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth");

const {
  signupValidation,
  loginValidation,
  validate,
} = require("../validations/auth.validation");

const router = express.Router();

router.post(
  "/signup",
  signupValidation,
  validate,
  authController.signup
);

router.post(
  "/login",
  loginValidation,
  validate,
  authController.login
);

router.post(
  "/logout",
  authMiddleware,
  authController.logout
);

router.post(
  "/refresh",
  authController.refresh
);

router.get(
  "/me",
  authMiddleware,
  authController.me
);

module.exports = router;