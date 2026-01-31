import * as adminService from './service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';

export const getDashboard = async (req, res) => {
    try {
        const stats = await adminService.getDashboardStats();
        return successResponse(res, stats, 'Dashboard stats fetched successfully');
    } catch (error) {
        logger.error(`Error in getDashboard: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const { role, kycStatus, search, page = 1, limit = 50 } = req.query;

        const result = await adminService.getAllUsers(
            { role, kycStatus, search },
            parseInt(page),
            parseInt(limit)
        );

        return successResponse(res, result, 'Users fetched successfully');
    } catch (error) {
        logger.error(`Error in getAllUsers: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const details = await adminService.getUserDetails(userId);
        return successResponse(res, details, 'User details fetched successfully');
    } catch (error) {
        logger.error(`Error in getUserDetails: ${error.message}`);
        return errorResponse(res, error.message, 404);
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { userId } = req.params;
        const { isActive } = req.body;

        const result = await adminService.updateUserStatus(adminId, userId, isActive);
        return successResponse(res, result, 'User status updated successfully');
    } catch (error) {
        logger.error(`Error in updateUserStatus: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const { type, page = 1, limit = 50 } = req.query;

        if (!type || !['service', 'rental', 'parts'].includes(type)) {
            return errorResponse(res, 'Valid type (service, rental, parts) is required', 400);
        }

        const result = await adminService.getAllBookings(type, parseInt(page), parseInt(limit));
        return successResponse(res, result, 'Bookings fetched successfully');
    } catch (error) {
        logger.error(`Error in getAllBookings: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const result = await adminService.getAllPayments(parseInt(page), parseInt(limit));
        return successResponse(res, result, 'Payments fetched successfully');
    } catch (error) {
        logger.error(`Error in getAllPayments: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getRevenueAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return errorResponse(res, 'Start date and end date are required', 400);
        }

        const analytics = await adminService.getRevenueAnalytics(startDate, endDate);
        return successResponse(res, analytics, 'Revenue analytics fetched successfully');
    } catch (error) {
        logger.error(`Error in getRevenueAnalytics: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getAdminActions = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const adminId = req.query.adminId || null;

        const result = await adminService.getAdminActions(adminId, parseInt(page), parseInt(limit));
        return successResponse(res, result, 'Admin actions fetched successfully');
    } catch (error) {
        logger.error(`Error in getAdminActions: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};
