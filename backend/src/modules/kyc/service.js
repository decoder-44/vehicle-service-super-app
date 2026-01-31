import pool from '../../database/connection.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger.js';
import { CustomError } from '../../errors/customError.js';
import { ERROR_CODES } from '../../errors/errorCodes.js';
import { STATUS_CODES } from '../users/constants.js';

/**
 * KYC Service
 * Handles KYC document submission, verification, and management
 */

/**
 * Submit KYC documents for verification
 * @param {string} userId - User ID
 * @param {object} data - KYC document data
 * @returns {object} Submitted KYC document
 */
export const submitKycDocuments = async (userId, data) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const {
            documentType,
            documentNumber,
            documentFrontUrl,
            documentBackUrl,
            selfieUrl
        } = data;

        // Check if user already has a pending or approved KYC
        const existingKyc = await client.query(
            `SELECT id, status FROM kyc_documents 
       WHERE user_id = $1 AND status IN ('pending', 'verified')
       ORDER BY created_at DESC LIMIT 1`,
            [userId]
        );

        if (existingKyc.rows.length > 0 && existingKyc.rows[0].status === 'verified') {
            throw new Error('User already has verified KYC documents');
        }

        const kycId = uuidv4();
        const result = await client.query(
            `INSERT INTO kyc_documents (
        id, user_id, document_type, document_number, 
        document_front_url, document_back_url, selfie_url, 
        status, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
      RETURNING *`,
            [kycId, userId, documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl]
        );

        // Update user's KYC status to submitted
        await client.query(
            `UPDATE users SET kyc_status = 'submitted', updated_at = NOW() 
       WHERE id = $1`,
            [userId]
        );

        await client.query('COMMIT');
        logger.info(`KYC documents submitted for user: ${userId}`);

        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error(`Error submitting KYC documents: ${error.message}`);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Get user's KYC documents
 * @param {string} userId - User ID
 * @returns {array} List of KYC documents
 */
export const getUserKycDocuments = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT id, document_type, document_number, status, 
              submitted_at, verified_at, rejection_reason, created_at
       FROM kyc_documents 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
            [userId]
        );

        return result.rows;
    } catch (error) {
        logger.error(`Error fetching KYC documents: ${error.message}`);
        throw error;
    }
};

/**
 * Get KYC document by ID
 * @param {string} kycId - KYC document ID
 * @param {string} userId - User ID (for authorization)
 * @returns {object} KYC document
 */
export const getKycDocumentById = async (kycId, userId) => {
    try {
        const result = await pool.query(
            `SELECT * FROM kyc_documents 
       WHERE id = $1 AND user_id = $2`,
            [kycId, userId]
        );

        if (result.rows.length === 0) {
            throw new Error('KYC document not found');
        }

        return result.rows[0];
    } catch (error) {
        logger.error(`Error fetching KYC document: ${error.message}`);
        throw error;
    }
};

/**
 * Verify KYC document (Admin only)
 * @param {string} kycId - KYC document ID
 * @param {string} adminId - Admin user ID
 * @param {string} status - Verification status ('verified' or 'rejected')
 * @param {string} rejectionReason - Reason for rejection (if rejected)
 * @returns {object} Updated KYC document
 */
export const verifyKycDocument = async (kycId, adminId, status, rejectionReason = null) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Get KYC document
        const kycResult = await client.query(
            'SELECT user_id FROM kyc_documents WHERE id = $1',
            [kycId]
        );

        if (kycResult.rows.length === 0) {
            throw new Error('KYC document not found');
        }

        const userId = kycResult.rows[0].user_id;

        // Update KYC document
        const result = await client.query(
            `UPDATE kyc_documents 
       SET status = $1, 
           rejection_reason = $2,
           verified_at = CASE WHEN $1 = 'verified' THEN NOW() ELSE NULL END,
           admin_reviewed_by = $3,
           admin_reviewed_at = NOW(),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
            [status, rejectionReason, adminId, kycId]
        );

        // Update user's KYC status
        let userKycStatus;
        if (status === 'verified') {
            userKycStatus = 'approved';
            await client.query(
                `UPDATE users 
         SET kyc_status = 'approved', 
             kyc_verified_at = NOW(), 
             is_verified = true,
             updated_at = NOW()
         WHERE id = $1`,
                [userId]
            );
        } else if (status === 'rejected') {
            userKycStatus = 'rejected';
            await client.query(
                `UPDATE users 
         SET kyc_status = 'rejected', 
             updated_at = NOW()
         WHERE id = $1`,
                [userId]
            );
        }

        // Log admin action
        await client.query(
            `INSERT INTO admin_actions (
        id, admin_id, action_type, target_entity, target_id, 
        action_details, created_at
      ) VALUES ($1, $2, 'KYC_VERIFICATION', 'kyc_documents', $3, $4, NOW())`,
            [
                uuidv4(),
                adminId,
                kycId,
                JSON.stringify({ status, rejectionReason })
            ]
        );

        await client.query('COMMIT');
        logger.info(`KYC document ${kycId} ${status} by admin ${adminId}`);

        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error(`Error verifying KYC document: ${error.message}`);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Get all pending KYC documents (Admin only)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} Paginated KYC documents
 */
export const getPendingKycDocuments = async (page = 1, limit = 20) => {
    try {
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT k.*, u.full_name, u.email, u.phone
       FROM kyc_documents k
       JOIN users u ON k.user_id = u.id
       WHERE k.status = 'pending'
       ORDER BY k.submitted_at ASC
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM kyc_documents WHERE status = 'pending'`
        );

        return {
            documents: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        };
    } catch (error) {
        logger.error(`Error fetching pending KYC documents: ${error.message}`);
        throw error;
    }
};

/**
 * Get KYC statistics (Admin only)
 * @returns {object} KYC statistics
 */
export const getKycStatistics = async () => {
    try {
        const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'verified') as verified_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        COUNT(*) as total_count
      FROM kyc_documents
    `);

        return result.rows[0];
    } catch (error) {
        logger.error(`Error fetching KYC statistics: ${error.message}`);
        throw error;
    }
};
