import * as rentalService from './service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';

export const createVehicle = async (req, res) => {
    try {
        const hostId = req.user.id;
        const result = await rentalService.createRentalVehicle(hostId, req.body);
        return successResponse(res, result, 'Rental vehicle created successfully', 201);
    } catch (error) {
        logger.error(`Error in createVehicle: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getAllVehicles = async (req, res) => {
    try {
        const { vehicleType, city, minPrice, maxPrice, search, page = 1, limit = 20 } = req.query;
        const result = await rentalService.getAllRentalVehicles(
            { vehicleType, city, minPrice, maxPrice, search },
            parseInt(page),
            parseInt(limit)
        );
        return successResponse(res, result, 'Rental vehicles fetched successfully');
    } catch (error) {
        logger.error(`Error in getAllVehicles: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getVehicleById = async (req, res) => {
    try {
        const vehicle = await rentalService.getVehicleById(req.params.id);
        return successResponse(res, vehicle, 'Vehicle fetched successfully');
    } catch (error) {
        logger.error(`Error in getVehicleById: ${error.message}`);
        return errorResponse(res, error.message, 404);
    }
};

export const updateVehicle = async (req, res) => {
    try {
        const hostId = req.user.id;
        const result = await rentalService.updateRentalVehicle(req.params.id, hostId, req.body);
        return successResponse(res, result, 'Vehicle updated successfully');
    } catch (error) {
        logger.error(`Error in updateVehicle: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const createBooking = async (req, res) => {
    try {
        const customerId = req.user.id;
        const result = await rentalService.createRentalBooking(customerId, req.body);
        return successResponse(res, result, 'Rental booking created successfully', 201);
    } catch (error) {
        logger.error(`Error in createBooking: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getBookingById = async (req, res) => {
    try {
        const userId = req.user.id;
        const booking = await rentalService.getRentalBookingById(req.params.id, userId);
        return successResponse(res, booking, 'Booking fetched successfully');
    } catch (error) {
        logger.error(`Error in getBookingById: ${error.message}`);
        return errorResponse(res, error.message, 404);
    }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, ...additionalData } = req.body;
        const result = await rentalService.updateRentalBookingStatus(
            req.params.id,
            userId,
            status,
            additionalData
        );
        return successResponse(res, result, 'Booking status updated successfully');
    } catch (error) {
        logger.error(`Error in updateBookingStatus: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { page = 1, limit = 20 } = req.query;
        const result = await rentalService.getUserRentalBookings(
            userId,
            userRole,
            parseInt(page),
            parseInt(limit)
        );
        return successResponse(res, result, 'Bookings fetched successfully');
    } catch (error) {
        logger.error(`Error in getUserBookings: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};
