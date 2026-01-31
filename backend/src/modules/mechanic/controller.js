import * as mechanicService from './service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';

/**
 * Mechanic Controller
 * Handles HTTP requests for mechanic services
 */

/**
 * Create mechanic profile
 * POST /api/mechanic/profile
 */
export const createProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profileData = req.body;

        const result = await mechanicService.createMechanicProfile(userId, profileData);

        return successResponse(res, result, 'Mechanic profile created successfully', 201);
    } catch (error) {
        logger.error(`Error in createProfile controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get mechanic profile
 * GET /api/mechanic/profile
 */
export const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const profile = await mechanicService.getMechanicProfile(userId);

        return successResponse(res, profile, 'Mechanic profile fetched successfully');
    } catch (error) {
        logger.error(`Error in getProfile controller: ${error.message}`);
        return errorResponse(res, error.message, 404);
    }
};

/**
 * Update mechanic profile
 * PUT /api/mechanic/profile
 */
export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profileData = req.body;

        const result = await mechanicService.updateMechanicProfile(userId, profileData);

        return successResponse(res, result, 'Mechanic profile updated successfully');
    } catch (error) {
        logger.error(`Error in updateProfile controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Find nearby mechanics
 * GET /api/mechanic/nearby
 */
export const findNearby = async (req, res, next) => {
    try {
        const { latitude, longitude, serviceType, vehicleType, radius = 10 } = req.query;

        if (!latitude || !longitude) {
            return errorResponse(res, 'Latitude and longitude are required', 400);
        }

        const mechanics = await mechanicService.findNearbyMechanics(
            parseFloat(latitude),
            parseFloat(longitude),
            serviceType,
            vehicleType,
            parseFloat(radius)
        );

        return successResponse(res, mechanics, 'Nearby mechanics fetched successfully');
    } catch (error) {
        logger.error(`Error in findNearby controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Create service booking
 * POST /api/mechanic/bookings
 */
export const createBooking = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const bookingData = req.body;

        const result = await mechanicService.createServiceBooking(customerId, bookingData);

        return successResponse(res, result, 'Service booking created successfully', 201);
    } catch (error) {
        logger.error(`Error in createBooking controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Assign mechanic to booking
 * POST /api/mechanic/bookings/:id/assign
 */
export const assignMechanic = async (req, res, next) => {
    try {
        const mechanicId = req.user.id;
        const { id } = req.params;

        const result = await mechanicService.assignMechanicToBooking(id, mechanicId);

        return successResponse(res, result, 'Mechanic assigned successfully');
    } catch (error) {
        logger.error(`Error in assignMechanic controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Update booking status
 * PUT /api/mechanic/bookings/:id/status
 */
export const updateBookingStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { status, ...additionalData } = req.body;

        const result = await mechanicService.updateBookingStatus(
            id,
            userId,
            status,
            additionalData
        );

        return successResponse(res, result, 'Booking status updated successfully');
    } catch (error) {
        logger.error(`Error in updateBookingStatus controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get booking by ID
 * GET /api/mechanic/bookings/:id
 */
export const getBookingById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const booking = await mechanicService.getBookingById(id, userId);

        return successResponse(res, booking, 'Booking fetched successfully');
    } catch (error) {
        logger.error(`Error in getBookingById controller: ${error.message}`);
        return errorResponse(res, error.message, 404);
    }
};

/**
 * Get user's bookings
 * GET /api/mechanic/bookings
 */
export const getUserBookings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { page = 1, limit = 20 } = req.query;

        const result = await mechanicService.getUserBookings(
            userId,
            userRole,
            parseInt(page),
            parseInt(limit)
        );

        return successResponse(res, result, 'Bookings fetched successfully');
    } catch (error) {
        logger.error(`Error in getUserBookings controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Add booking review
 * POST /api/mechanic/bookings/:id/review
 */
export const addReview = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const { id } = req.params;
        const { rating, review } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return errorResponse(res, 'Valid rating (1-5) is required', 400);
        }

        const result = await mechanicService.addBookingReview(
            id,
            customerId,
            rating,
            review
        );

        return successResponse(res, result, 'Review added successfully');
    } catch (error) {
        logger.error(`Error in addReview controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};
