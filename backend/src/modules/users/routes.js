import express from 'express';
import * as userController from './controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

/**
 * User Routes - Phase 1.5
 * All routes require authentication
 */

// User Profile Routes
router.get('/me/getProfile', requireAuth, userController.getProfile);
router.put('/me/updateProfile', requireAuth, userController.updateProfile);
router.delete('/me/deactivateAccount', requireAuth, userController.deactivateAccount);

// Password Management
router.post('/change-password', requireAuth, userController.changePassword);

// Address Management
router.post('/add-addresses', requireAuth, userController.addAddress);
router.get('/get-addresses', requireAuth, userController.getAddresses);
router.put('/update-addresses/:id', requireAuth, userController.updateAddress);
router.delete('/delete-addresses/:id', requireAuth, userController.deleteAddress);

// Role Conversion
router.post('/convert-role', requireAuth, userController.convertRole);

export default router;
