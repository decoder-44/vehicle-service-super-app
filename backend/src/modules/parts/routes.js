import express from 'express';
import * as partsController from './controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

/**
 * Parts Marketplace Routes
 */

// Part listing routes
router.post('/', authenticateToken, partsController.createPart);
router.get('/', partsController.getAllParts); // Public route
router.get('/:id', partsController.getPartById); // Public route
router.put('/:id', authenticateToken, partsController.updatePart);
router.delete('/:id', authenticateToken, partsController.deletePart);

// Order routes
router.post('/orders', authenticateToken, partsController.createOrder);
router.get('/orders', authenticateToken, partsController.getUserOrders);
router.get('/orders/:id', authenticateToken, partsController.getOrderById);
router.put('/orders/:id/status', authenticateToken, partsController.updateOrderStatus);

export default router;
