import express from 'express';
import * as mechanicController from './controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

/**
 * Mechanic Service Routes
 */

// Mechanic profile routes
router.post('/profile', authenticateToken, mechanicController.createProfile);
router.get('/profile', authenticateToken, mechanicController.getProfile);
router.put('/profile', authenticateToken, mechanicController.updateProfile);

// Find mechanics
router.get('/nearby', mechanicController.findNearby); // Public route

// Booking routes
router.post('/bookings', authenticateToken, mechanicController.createBooking);
router.get('/bookings', authenticateToken, mechanicController.getUserBookings);
router.get('/bookings/:id', authenticateToken, mechanicController.getBookingById);
router.post('/bookings/:id/assign', authenticateToken, mechanicController.assignMechanic);
router.put('/bookings/:id/status', authenticateToken, mechanicController.updateBookingStatus);
router.post('/bookings/:id/review', authenticateToken, mechanicController.addReview);

export default router;
