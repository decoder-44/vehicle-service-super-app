import * as partsService from './service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';

/**
 * Parts Controller
 * Handles HTTP requests for parts marketplace operations
 */

/**
 * Create part listing
 * POST /api/parts
 */
export const createPart = async (req, res, next) => {
    try {
        const merchantId = req.user.id;
        const partData = req.body;

        const result = await partsService.createPartListing(merchantId, partData);

        return successResponse(res, result, 'Part listing created successfully', 201);
    } catch (error) {
        logger.error(`Error in createPart controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get all parts with filters
 * GET /api/parts
 */
export const getAllParts = async (req, res, next) => {
    try {
        const {
            vehicleType, category, search, merchantId,
            minPrice, maxPrice, page = 1, limit = 20
        } = req.query;

        const filters = {
            vehicleType, category, search, merchantId,
            minPrice, maxPrice
        };

        const result = await partsService.getAllParts(
            filters,
            parseInt(page),
            parseInt(limit)
        );

        return successResponse(res, result, 'Parts fetched successfully');
    } catch (error) {
        logger.error(`Error in getAllParts controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get part by ID
 * GET /api/parts/:id
 */
export const getPartById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const part = await partsService.getPartById(id);

        return successResponse(res, part, 'Part fetched successfully');
    } catch (error) {
        logger.error(`Error in getPartById controller: ${error.message}`);
        return errorResponse(res, error.message, 404);
    }
};

/**
 * Update part listing
 * PUT /api/parts/:id
 */
export const updatePart = async (req, res, next) => {
    try {
        const merchantId = req.user.id;
        const { id } = req.params;
        const partData = req.body;

        const result = await partsService.updatePartListing(id, merchantId, partData);

        return successResponse(res, result, 'Part updated successfully');
    } catch (error) {
        logger.error(`Error in updatePart controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Delete part listing
 * DELETE /api/parts/:id
 */
export const deletePart = async (req, res, next) => {
    try {
        const merchantId = req.user.id;
        const { id } = req.params;

        await partsService.deletePartListing(id, merchantId);

        return successResponse(res, null, 'Part deleted successfully');
    } catch (error) {
        logger.error(`Error in deletePart controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Create part order
 * POST /api/parts/orders
 */
export const createOrder = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const orderData = req.body;

        const result = await partsService.createPartOrder(customerId, orderData);

        return successResponse(res, result, 'Order created successfully', 201);
    } catch (error) {
        logger.error(`Error in createOrder controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get order by ID
 * GET /api/parts/orders/:id
 */
export const getOrderById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const order = await partsService.getOrderById(id, userId);

        return successResponse(res, order, 'Order fetched successfully');
    } catch (error) {
        logger.error(`Error in getOrderById controller: ${error.message}`);
        return errorResponse(res, error.message, 404);
    }
};

/**
 * Get user's orders
 * GET /api/parts/orders
 */
export const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { page = 1, limit = 20 } = req.query;

        const result = await partsService.getUserOrders(
            userId,
            userRole,
            parseInt(page),
            parseInt(limit)
        );

        return successResponse(res, result, 'Orders fetched successfully');
    } catch (error) {
        logger.error(`Error in getUserOrders controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Update order status
 * PUT /api/parts/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
    try {
        const merchantId = req.user.id;
        const { id } = req.params;
        const { status, ...additionalData } = req.body;

        const result = await partsService.updateOrderStatus(
            id,
            merchantId,
            status,
            additionalData
        );

        return successResponse(res, result, 'Order status updated successfully');
    } catch (error) {
        logger.error(`Error in updateOrderStatus controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};
