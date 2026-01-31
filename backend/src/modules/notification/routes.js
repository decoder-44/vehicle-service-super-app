import express from 'express';
import * as notificationController from './controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

router.get('/my-notifications', authenticateToken, notificationController.getMyNotifications);
router.put('/:id/read', authenticateToken, notificationController.markAsRead);
router.post('/send', authenticateToken, notificationController.sendNotification);
router.post('/send-bulk', authenticateToken, notificationController.sendBulkNotifications);

export default router;
