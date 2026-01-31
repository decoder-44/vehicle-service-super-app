import express from 'express';
import * as cleaningController from './controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

router.post('/bookings', authenticateToken, cleaningController.createBooking);
router.get('/bookings', authenticateToken, cleaningController.getMyBookings);
router.get('/bookings/:id', authenticateToken, cleaningController.getBookingById);
router.put('/bookings/:id/status', authenticateToken, cleaningController.updateBookingStatus);

export default router;
