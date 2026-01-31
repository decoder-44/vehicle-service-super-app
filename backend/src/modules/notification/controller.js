import * as notificationService from './service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';

export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        const result = await notificationService.getUserNotifications(
            userId,
            parseInt(page),
            parseInt(limit)
        );

        return successResponse(res, result, 'Notifications fetched successfully');
    } catch (error) {
        logger.error(`Error in getMyNotifications: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await notificationService.markNotificationAsRead(id, userId);

        return successResponse(res, result, 'Notification marked as read');
    } catch (error) {
        logger.error(`Error in markAsRead: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const sendNotification = async (req, res) => {
    try {
        const { userId, ...notificationData } = req.body;

        const result = await notificationService.createNotification(userId, notificationData);

        return successResponse(res, result, 'Notification sent successfully', 201);
    } catch (error) {
        logger.error(`Error in sendNotification: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const sendBulkNotifications = async (req, res) => {
    try {
        const { userIds, ...notificationData } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return errorResponse(res, 'Valid userIds array is required', 400);
        }

        const result = await notificationService.sendBulkNotifications(userIds, notificationData);

        return successResponse(res, result, 'Bulk notifications sent successfully', 201);
    } catch (error) {
        logger.error(`Error in sendBulkNotifications: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};
