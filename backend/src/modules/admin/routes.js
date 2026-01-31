import express from 'express';
import * as adminController from './controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/authorization.js';

const router = express.Router();

/**
 * Admin Routes
 * All routes require authentication and admin role
 */

router.get('/dashboard', authenticateToken, requireAdmin, adminController.getDashboard);
router.get('/users', authenticateToken, requireAdmin, adminController.getAllUsers);
router.get('/users/:userId', authenticateToken, requireAdmin, adminController.getUserDetails);
router.put('/users/:userId/status', authenticateToken, requireAdmin, adminController.updateUserStatus);
router.get('/bookings', authenticateToken, requireAdmin, adminController.getAllBookings);
router.get('/payments', authenticateToken, requireAdmin, adminController.getAllPayments);
router.get('/analytics/revenue', authenticateToken, requireAdmin, adminController.getRevenueAnalytics);
router.get('/actions', authenticateToken, requireAdmin, adminController.getAdminActions);

export default router;
