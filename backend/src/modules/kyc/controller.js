import * as kycService from './service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';

/**
 * KYC Controller
 * Handles HTTP requests for KYC operations
 */

/**
 * Submit KYC documents
 * POST /api/kyc/submit
 */
export const submitKyc = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const kycData = req.body;

        const result = await kycService.submitKycDocuments(userId, kycData);

        return successResponse(res, result, 'KYC documents submitted successfully', 201);
    } catch (error) {
        logger.error(`Error in submitKyc controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get user's KYC documents
 * GET /api/kyc/my-documents
 */
export const getMyKycDocuments = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const documents = await kycService.getUserKycDocuments(userId);

        return successResponse(res, documents, 'KYC documents fetched successfully');
    } catch (error) {
        logger.error(`Error in getMyKycDocuments controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get KYC document by ID
 * GET /api/kyc/:id
 */
export const getKycDocument = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const document = await kycService.getKycDocumentById(id, userId);

        return successResponse(res, document, 'KYC document fetched successfully');
    } catch (error) {
        logger.error(`Error in getKycDocument controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get pending KYC documents (Admin only)
 * GET /api/kyc/admin/pending
 */
export const getPendingKyc = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const result = await kycService.getPendingKycDocuments(
            parseInt(page),
            parseInt(limit)
        );

        return successResponse(res, result, 'Pending KYC documents fetched successfully');
    } catch (error) {
        logger.error(`Error in getPendingKyc controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Verify KYC document (Admin only)
 * PUT /api/kyc/admin/verify/:id
 */
export const verifyKyc = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return errorResponse(res, 'Invalid status', 400);
        }

        if (status === 'rejected' && !rejectionReason) {
            return errorResponse(res, 'Rejection reason is required', 400);
        }

        const result = await kycService.verifyKycDocument(
            id,
            adminId,
            status,
            rejectionReason
        );

        return successResponse(res, result, 'KYC verification completed successfully');
    } catch (error) {
        logger.error(`Error in verifyKyc controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get KYC statistics (Admin only)
 * GET /api/kyc/admin/statistics
 */
export const getKycStats = async (req, res, next) => {
    try {
        const stats = await kycService.getKycStatistics();

        return successResponse(res, stats, 'KYC statistics fetched successfully');
    } catch (error) {
        logger.error(`Error in getKycStats controller: ${error.message}`);
        return errorResponse(res, error.message, 400);
    }
};
