import * as cleaningService from './service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';

export const createBooking = async (req, res) => {
    try {
        const customerId = req.user.id;
        const result = await cleaningService.createCleaningBooking(customerId, req.body);
        return successResponse(res, result, 'Cleaning/decoration booking created successfully', 201);
    } catch (error) {
        logger.error(`Error in createBooking: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const result = await cleaningService.getCleaningBookings(userId, parseInt(page), parseInt(limit));
        return successResponse(res, result, 'Bookings fetched successfully');
    } catch (error) {
        logger.error(`Error in getMyBookings: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getBookingById = async (req, res) => {
    try {
        const userId = req.user.id;
        const booking = await cleaningService.getCleaningBookingById(req.params.id, userId);
        return successResponse(res, booking, 'Booking fetched successfully');
    } catch (error) {
        logger.error(`Error in getBookingById: ${error.message}`);
        return errorResponse(res, error.message, 404);
    }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const { status, ...additionalData } = req.body;
        const result = await cleaningService.updateCleaningBookingStatus(req.params.id, status, additionalData);
        return successResponse(res, result, 'Booking status updated successfully');
    } catch (error) {
        logger.error(`Error in updateBookingStatus: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};
