import pool from '../../database/connection.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger.js';

/**
 * Cleaning & Decoration Service
 * Uses the service_bookings table with service_type = 'cleaning' or 'decoration'
 */

export const createCleaningBooking = async (customerId, bookingData) => {
    try {
        const {
            serviceType, // 'cleaning' or 'decoration'
            vehicleType,
            vehicleDetails,
            serviceLocationLat,
            serviceLocationLng,
            serviceLocationAddress,
            preferredDatetime,
            serviceDescription,
            packageType // e.g., 'basic', 'premium', 'deluxe'
        } = bookingData;

        const bookingId = uuidv4();
        const bookingNumber = `CLN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Price estimation based on service type and package
        const priceMap = {
            cleaning: { basic: 300, premium: 600, deluxe: 1200 },
            decoration: { basic: 500, premium: 1000, deluxe: 2000 }
        };

        const estimatedPrice = priceMap[serviceType]?.[packageType] || 500;

        const result = await pool.query(
            `INSERT INTO service_bookings (
        id, booking_number, customer_id, service_type, vehicle_type,
        vehicle_details, service_location_lat, service_location_lng,
        service_location_address, preferred_datetime, service_description,
        estimated_price, booking_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')
      RETURNING *`,
            [
                bookingId, bookingNumber, customerId, serviceType, vehicleType,
                JSON.stringify({ ...vehicleDetails, packageType }),
                serviceLocationLat, serviceLocationLng,
                serviceLocationAddress, preferredDatetime, serviceDescription,
                estimatedPrice
            ]
        );

        logger.info(`Cleaning/decoration booking created: ${bookingId}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error creating cleaning booking: ${error.message}`);
        throw error;
    }
};

export const getCleaningBookings = async (userId, page = 1, limit = 20) => {
    try {
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT * FROM service_bookings 
       WHERE customer_id = $1 AND service_type IN ('cleaning', 'decoration')
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM service_bookings 
       WHERE customer_id = $1 AND service_type IN ('cleaning', 'decoration')`,
            [userId]
        );

        return {
            bookings: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        };
    } catch (error) {
        logger.error(`Error fetching cleaning bookings: ${error.message}`);
        throw error;
    }
};

export const getCleaningBookingById = async (bookingId, userId) => {
    try {
        const result = await pool.query(
            `SELECT b.*, u.full_name, u.phone
       FROM service_bookings b
       JOIN users u ON b.customer_id = u.id
       WHERE b.id = $1 AND b.customer_id = $2 AND b.service_type IN ('cleaning', 'decoration')`,
            [bookingId, userId]
        );

        if (result.rows.length === 0) {
            throw new Error('Booking not found');
        }

        return result.rows[0];
    } catch (error) {
        logger.error(`Error fetching cleaning booking: ${error.message}`);
        throw error;
    }
};

export const updateCleaningBookingStatus = async (bookingId, status, additionalData = {}) => {
    try {
        const { finalPrice, cancellationReason } = additionalData;

        const result = await pool.query(
            `UPDATE service_bookings 
       SET booking_status = $1,
           final_price = COALESCE($2, final_price),
           cancellation_reason = COALESCE($3, cancellation_reason),
           service_completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE service_completed_at END,
           updated_at = NOW()
       WHERE id = $4 AND service_type IN ('cleaning', 'decoration')
       RETURNING *`,
            [status, finalPrice, cancellationReason, bookingId]
        );

        if (result.rows.length === 0) {
            throw new Error('Booking not found');
        }

        logger.info(`Cleaning booking ${bookingId} status updated to ${status}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error updating cleaning booking status: ${error.message}`);
        throw error;
    }
};
