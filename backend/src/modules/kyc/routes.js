import express from 'express';
import * as kycController from './controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/authorization.js';

const router = express.Router();

/**
 * KYC Routes
 * All routes require authentication
 */

// User routes
router.post('/submit', authenticateToken, kycController.submitKyc);
router.get('/my-documents', authenticateToken, kycController.getMyKycDocuments);
router.get('/:id', authenticateToken, kycController.getKycDocument);

// Admin routes
router.get('/admin/pending', authenticateToken, requireAdmin, kycController.getPendingKyc);
router.put('/admin/verify/:id', authenticateToken, requireAdmin, kycController.verifyKyc);
router.get('/admin/statistics', authenticateToken, requireAdmin, kycController.getKycStats);

export default router;
