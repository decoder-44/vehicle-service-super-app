import pool from '../../database/connection.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger.js';

/**
 * RSA (Roadside Assistance) Service
 */

export const createRSASubscription = async (userId, subscriptionData) => {
    try {
        const { planName, planPrice, benefits, durationMonths } = subscriptionData;

        const subscriptionId = uuidv4();
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + durationMonths);

        const result = await pool.query(
            `INSERT INTO rsa_subscriptions (
        id, user_id, plan_name, plan_price, benefits,
        start_date, end_date, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING *`,
            [
                subscriptionId, userId, planName, planPrice,
                JSON.stringify(benefits), startDate, endDate
            ]
        );

        logger.info(`RSA subscription created: ${subscriptionId}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error creating RSA subscription: ${error.message}`);
        throw error;
    }
};

export const getUserSubscriptions = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT * FROM rsa_subscriptions 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
            [userId]
        );

        return result.rows;
    } catch (error) {
        logger.error(`Error fetching subscriptions: ${error.message}`);
        throw error;
    }
};

export const getActiveSubscription = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT * FROM rsa_subscriptions 
       WHERE user_id = $1 AND is_active = true 
       AND end_date >= CURRENT_DATE
       ORDER BY end_date DESC
       LIMIT 1`,
            [userId]
        );

        return result.rows[0] || null;
    } catch (error) {
        logger.error(`Error fetching active subscription: ${error.message}`);
        throw error;
    }
};

export const createRSARequest = async (userId, requestData) => {
    try {
        const {
            emergencyType, locationLat, locationLng, locationAddress, vehicleDetails
        } = requestData;

        // Check if user has active subscription
        const subscription = await getActiveSubscription(userId);
        if (!subscription) {
            throw new Error('No active RSA subscription found');
        }

        const requestId = uuidv4();
        const requestNumber = `RSA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const result = await pool.query(
            `INSERT INTO rsa_requests (
        id, request_number, user_id, subscription_id, emergency_type,
        location_lat, location_lng, location_address, vehicle_details,
        request_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING *`,
            [
                requestId, requestNumber, userId, subscription.id, emergencyType,
                locationLat, locationLng, locationAddress, JSON.stringify(vehicleDetails)
            ]
        );

        logger.info(`RSA request created: ${requestId}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error creating RSA request: ${error.message}`);
        throw error;
    }
};

export const getRSARequestById = async (requestId, userId) => {
    try {
        const result = await pool.query(
            `SELECT r.*, u.full_name, u.phone,
              p.full_name as partner_name, p.phone as partner_phone
       FROM rsa_requests r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN users p ON r.service_partner_id = p.id
       WHERE r.id = $1 AND r.user_id = $2`,
            [requestId, userId]
        );

        if (result.rows.length === 0) {
            throw new Error('RSA request not found');
        }

        return result.rows[0];
    } catch (error) {
        logger.error(`Error fetching RSA request: ${error.message}`);
        throw error;
    }
};

export const getUserRSARequests = async (userId, page = 1, limit = 20) => {
    try {
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT * FROM rsa_requests 
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM rsa_requests WHERE user_id = $1`,
            [userId]
        );

        return {
            requests: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        };
    } catch (error) {
        logger.error(`Error fetching RSA requests: ${error.message}`);
        throw error;
    }
};

export const updateRSARequestStatus = async (requestId, status, additionalData = {}) => {
    try {
        const { servicePartnerId, resolutionNotes } = additionalData;

        let updateQuery = `
      UPDATE rsa_requests 
      SET request_status = $1,
          service_partner_id = COALESCE($2, service_partner_id),
          resolution_notes = COALESCE($3, resolution_notes),
    `;

        if (status === 'assigned') {
            updateQuery += 'partner_assigned_at = NOW(),';
        } else if (status === 'in_progress') {
            updateQuery += 'service_started_at = NOW(),';
        } else if (status === 'completed') {
            updateQuery += 'service_completed_at = NOW(),';
        }

        updateQuery += `
          updated_at = NOW()
       WHERE id = $4
       RETURNING *
    `;

        const result = await pool.query(updateQuery, [
            status, servicePartnerId, resolutionNotes, requestId
        ]);

        if (result.rows.length === 0) {
            throw new Error('RSA request not found');
        }

        logger.info(`RSA request ${requestId} status updated to ${status}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error updating RSA request status: ${error.message}`);
        throw error;
    }
};
