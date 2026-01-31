import * as paymentService from './service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';

export const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await paymentService.createPaymentOrder(userId, req.body);
        return successResponse(res, result, 'Payment order created successfully', 201);
    } catch (error) {
        logger.error(`Error in createOrder: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const result = await paymentService.verifyPayment(req.body);
        return successResponse(res, result, 'Payment verified successfully');
    } catch (error) {
        logger.error(`Error in verifyPayment: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const userId = req.user.id;
        const payment = await paymentService.getPaymentById(req.params.id, userId);
        return successResponse(res, payment, 'Payment fetched successfully');
    } catch (error) {
        logger.error(`Error in getPaymentById: ${error.message}`);
        return errorResponse(res, error.message, 404);
    }
};

export const getMyPayments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const result = await paymentService.getUserPayments(userId, parseInt(page), parseInt(limit));
        return successResponse(res, result, 'Payments fetched successfully');
    } catch (error) {
        logger.error(`Error in getMyPayments: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

export const refund = async (req, res) => {
    try {
        const { paymentId, amount, reason } = req.body;
        const result = await paymentService.initiateRefund(paymentId, amount, reason);
        return successResponse(res, result, 'Refund initiated successfully');
    } catch (error) {
        logger.error(`Error in refund: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};
