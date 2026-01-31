import express from 'express';
import * as rsaController from './controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Subscription routes
router.post('/subscribe', authenticateToken, rsaController.subscribe);
router.get('/subscriptions', authenticateToken, rsaController.getMySubscriptions);
router.get('/subscriptions/active', authenticateToken, rsaController.getActiveSubscription);

// Request routes
router.post('/requests', authenticateToken, rsaController.createRequest);
router.get('/requests', authenticateToken, rsaController.getMyRequests);
router.get('/requests/:id', authenticateToken, rsaController.getRequestById);
router.put('/requests/:id/status', authenticateToken, rsaController.updateRequestStatus);

export default router;
