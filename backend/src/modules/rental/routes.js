import express from 'express';
import * as rentalController from './controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Vehicle routes
router.post('/vehicles', authenticateToken, rentalController.createVehicle);
router.get('/vehicles', rentalController.getAllVehicles);
router.get('/vehicles/:id', rentalController.getVehicleById);
router.put('/vehicles/:id', authenticateToken, rentalController.updateVehicle);

// Booking routes
router.post('/bookings', authenticateToken, rentalController.createBooking);
router.get('/bookings', authenticateToken, rentalController.getUserBookings);
router.get('/bookings/:id', authenticateToken, rentalController.getBookingById);
router.put('/bookings/:id/status', authenticateToken, rentalController.updateBookingStatus);

export default router;
