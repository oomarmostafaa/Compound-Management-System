const express = require('express');
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate');
const { loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('./auth.validation');

const router = express.Router();

// Login user
router.post('/login', validate(loginSchema), authController.login);

// Request forgot password email link
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

const authMiddleware = require('../../middlewares/auth');

// Reset password using token
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Change Password (authenticated)
router.post('/change-password', authMiddleware, authController.changePassword);

// Logout
router.post('/logout', authController.logout);

module.exports = router;