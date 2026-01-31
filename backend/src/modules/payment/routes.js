import express from 'express';
import * as paymentController from './controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

router.post('/create-order', authenticateToken, paymentController.createOrder);
router.post('/verify', authenticateToken, paymentController.verifyPayment);
router.get('/my-payments', authenticateToken, paymentController.getMyPayments);
router.get('/:id', authenticateToken, paymentController.getPaymentById);
router.post('/refund', authenticateToken, paymentController.refund);

export default router;
