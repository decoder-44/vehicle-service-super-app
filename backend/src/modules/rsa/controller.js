import * as rsaService from './service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';

export const subscribe = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await rsaService.createRSASubscription(userId, req.body);
        return successResponse(res, result, 'RSA subscription created successfully', 201);
    } catch (error) {
        logger.error(`Error in subscribe: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getMySubscriptions = async (req, res) => {
    try {
        const userId = req.user.id;
        const subscriptions = await rsaService.getUserSubscriptions(userId);
        return successResponse(res, subscriptions, 'Subscriptions fetched successfully');
    } catch (error) {
        logger.error(`Error in getMySubscriptions: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getActiveSubscription = async (req, res) => {
    try {
        const userId = req.user.id;
        const subscription = await rsaService.getActiveSubscription(userId);
        return successResponse(res, subscription, 'Active subscription fetched successfully');
    } catch (error) {
        logger.error(`Error in getActiveSubscription: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const createRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await rsaService.createRSARequest(userId, req.body);
        return successResponse(res, result, 'RSA request created successfully', 201);
    } catch (error) {
        logger.error(`Error in createRequest: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getRequestById = async (req, res) => {
    try {
        const userId = req.user.id;
        const request = await rsaService.getRSARequestById(req.params.id, userId);
        return successResponse(res, request, 'RSA request fetched successfully');
    } catch (error) {
        logger.error(`Error in getRequestById: ${error.message}`);
        return errorResponse(res, error.message, 404);
    }
};

export const getMyRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const result = await rsaService.getUserRSARequests(userId, parseInt(page), parseInt(limit));
        return successResponse(res, result, 'RSA requests fetched successfully');
    } catch (error) {
        logger.error(`Error in getMyRequests: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const updateRequestStatus = async (req, res) => {
    try {
        const { status, ...additionalData } = req.body;
        const result = await rsaService.updateRSARequestStatus(req.params.id, status, additionalData);
        return successResponse(res, result, 'RSA request status updated successfully');
    } catch (error) {
        logger.error(`Error in updateRequestStatus: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};
