import express from 'express';
import { authLimiter, otpLimiter } from '../../middleware/rateLimiter.js';
import { requireAuth } from '../../middleware/auth.js';
import * as authController from './controller.js';

const router = express.Router();

/**
 * Public auth routes
 */

// Send OTP
router.post('/send-otp', otpLimiter, authController.sendOTP);

// Verify OTP
router.post('/verify-otp', authController.verifyOTP);

// Register with email/password
router.post('/register', authLimiter, authController.register);

// Login with email/password
router.post('/login', authLimiter, authController.login);

// Verify email
router.post('/verify-email', authController.verifyEmailToken);

/**
 * Protected auth routes
 */

// Get current user
router.get('/me', requireAuth, authController.getCurrentUser);

export default router;
