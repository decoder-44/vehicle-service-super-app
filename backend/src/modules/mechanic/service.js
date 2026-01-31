import pool from '../../database/connection.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger.js';

/**
 * Mechanic Service
 * Handles mechanic profiles, service bookings, and matching
 */

/**
 * Create mechanic profile
 * @param {string} userId - User ID
 * @param {object} profileData - Mechanic profile data
 * @returns {object} Created profile
 */
export const createMechanicProfile = async (userId, profileData) => {
    try {
        const {
            serviceTypes, vehicleExpertise, serviceAreaCity, serviceRadiusKm,
            latitude, longitude, hourlyRate
        } = profileData;

        const profileId = uuidv4();
        const result = await pool.query(
            `INSERT INTO mechanic_profiles (
        id, user_id, service_types, vehicle_expertise, service_area_city,
        service_radius_km, latitude, longitude, hourly_rate, is_available
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING *`,
            [
                profileId, userId, JSON.stringify(serviceTypes), JSON.stringify(vehicleExpertise),
                serviceAreaCity, serviceRadiusKm, latitude, longitude, hourlyRate
            ]
        );

        // Update user role to mechanic
        await pool.query(
            `UPDATE users SET role = 'mechanic', updated_at = NOW() WHERE id = $1`,
            [userId]
        );

        logger.info(`Mechanic profile created for user: ${userId}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error creating mechanic profile: ${error.message}`);
        throw error;
    }
};

/**
 * Get mechanic profile
 * @param {string} userId - User ID
 * @returns {object} Mechanic profile
 */
export const getMechanicProfile = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT p.*, u.full_name, u.phone, u.email, u.kyc_status
       FROM mechanic_profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            throw new Error('Mechanic profile not found');
        }

        return result.rows[0];
    } catch (error) {
        logger.error(`Error fetching mechanic profile: ${error.message}`);
        throw error;
    }
};

/**
 * Update mechanic profile
 * @param {string} userId - User ID
 * @param {object} profileData - Updated profile data
 * @returns {object} Updated profile
 */
export const updateMechanicProfile = async (userId, profileData) => {
    try {
        const {
            serviceTypes, vehicleExpertise, serviceAreaCity, serviceRadiusKm,
            latitude, longitude, hourlyRate, isAvailable
        } = profileData;

        const result = await pool.query(
            `UPDATE mechanic_profiles 
       SET service_types = COALESCE($1, service_types),
           vehicle_expertise = COALESCE($2, vehicle_expertise),
           service_area_city = COALESCE($3, service_area_city),
           service_radius_km = COALESCE($4, service_radius_km),
           latitude = COALESCE($5, latitude),
           longitude = COALESCE($6, longitude),
           hourly_rate = COALESCE($7, hourly_rate),
           is_available = COALESCE($8, is_available),
           updated_at = NOW()
       WHERE user_id = $9
       RETURNING *`,
            [
                serviceTypes ? JSON.stringify(serviceTypes) : null,
                vehicleExpertise ? JSON.stringify(vehicleExpertise) : null,
                serviceAreaCity, serviceRadiusKm, latitude, longitude, hourlyRate,
                isAvailable, userId
            ]
        );

        if (result.rows.length === 0) {
            throw new Error('Mechanic profile not found');
        }

        logger.info(`Mechanic profile updated: ${userId}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error updating mechanic profile: ${error.message}`);
        throw error;
    }
};

/**
 * Find nearby mechanics
 * @param {number} latitude - Customer latitude
 * @param {number} longitude - Customer longitude
 * @param {string} serviceType - Service type
 * @param {string} vehicleType - Vehicle type
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {array} List of nearby mechanics
 */
export const findNearbyMechanics = async (latitude, longitude, serviceType, vehicleType, radiusKm = 10) => {
    try {
        // Using Haversine formula for distance calculation
        const result = await pool.query(
            `SELECT p.*, u.full_name, u.phone, u.profile_image_url, u.kyc_status,
              (6371 * acos(cos(radians($1)) * cos(radians(p.latitude)) * 
               cos(radians(p.longitude) - radians($2)) + 
               sin(radians($1)) * sin(radians(p.latitude)))) AS distance_km
       FROM mechanic_profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.is_available = true 
         AND u.kyc_status = 'approved'
         AND (6371 * acos(cos(radians($1)) * cos(radians(p.latitude)) * 
              cos(radians(p.longitude) - radians($2)) + 
              sin(radians($1)) * sin(radians(p.latitude)))) <= $3
       ORDER BY distance_km ASC
       LIMIT 20`,
            [latitude, longitude, radiusKm]
        );

        return result.rows;
    } catch (error) {
        logger.error(`Error finding nearby mechanics: ${error.message}`);
        throw error;
    }
};

/**
 * Create service booking
 * @param {string} customerId - Customer ID
 * @param {object} bookingData - Booking data
 * @returns {object} Created booking
 */
export const createServiceBooking = async (customerId, bookingData) => {
    try {
        const {
            serviceType, vehicleType, vehicleDetails, serviceLocationLat,
            serviceLocationLng, serviceLocationAddress, preferredDatetime,
            serviceDescription
        } = bookingData;

        const bookingId = uuidv4();
        const bookingNumber = `SRV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const result = await pool.query(
            `INSERT INTO service_bookings (
        id, booking_number, customer_id, service_type, vehicle_type,
        vehicle_details, service_location_lat, service_location_lng,
        service_location_address, preferred_datetime, service_description,
        booking_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
      RETURNING *`,
            [
                bookingId, bookingNumber, customerId, serviceType, vehicleType,
                JSON.stringify(vehicleDetails), serviceLocationLat, serviceLocationLng,
                serviceLocationAddress, preferredDatetime, serviceDescription
            ]
        );

        logger.info(`Service booking created: ${bookingId} for customer: ${customerId}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error creating service booking: ${error.message}`);
        throw error;
    }
};

/**
 * Assign mechanic to booking
 * @param {string} bookingId - Booking ID
 * @param {string} mechanicId - Mechanic ID
 * @returns {object} Updated booking
 */
export const assignMechanicToBooking = async (bookingId, mechanicId) => {
    try {
        const result = await pool.query(
            `UPDATE service_bookings 
       SET mechanic_id = $1,
           booking_status = 'assigned',
           mechanic_assigned_at = NOW(),
           updated_at = NOW()
       WHERE id = $2 AND booking_status = 'pending'
       RETURNING *`,
            [mechanicId, bookingId]
        );

        if (result.rows.length === 0) {
            throw new Error('Booking not found or already assigned');
        }

        logger.info(`Mechanic ${mechanicId} assigned to booking ${bookingId}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error assigning mechanic: ${error.message}`);
        throw error;
    }
};

/**
 * Update booking status
 * @param {string} bookingId - Booking ID
 * @param {string} userId - User ID (mechanic or customer)
 * @param {string} status - New status
 * @param {object} additionalData - Additional data
 * @returns {object} Updated booking
 */
export const updateBookingStatus = async (bookingId, userId, status, additionalData = {}) => {
    try {
        const { estimatedPrice, finalPrice, cancellationReason } = additionalData;

        let updateQuery = `
      UPDATE service_bookings 
      SET booking_status = $1,
          estimated_price = COALESCE($2, estimated_price),
          final_price = COALESCE($3, final_price),
          cancellation_reason = COALESCE($4, cancellation_reason),
    `;

        const statusUpdates = {
            'accepted': 'service_started_at = NOW()',
            'in_progress': 'service_started_at = COALESCE(service_started_at, NOW())',
            'completed': 'service_completed_at = NOW()'
        };

        if (statusUpdates[status]) {
            updateQuery += `${statusUpdates[status]},`;
        }

        updateQuery += `
          updated_at = NOW()
       WHERE id = $5 AND (customer_id = $6 OR mechanic_id = $6)
       RETURNING *
    `;

        const result = await pool.query(updateQuery, [
            status, estimatedPrice, finalPrice, cancellationReason, bookingId, userId
        ]);

        if (result.rows.length === 0) {
            throw new Error('Booking not found or unauthorized');
        }

        // If completed, update mechanic stats
        if (status === 'completed') {
            const booking = result.rows[0];
            await pool.query(
                `UPDATE mechanic_profiles 
         SET total_jobs = total_jobs + 1,
             updated_at = NOW()
         WHERE user_id = $1`,
                [booking.mechanic_id]
            );
        }

        logger.info(`Booking ${bookingId} status updated to ${status}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error updating booking status: ${error.message}`);
        throw error;
    }
};

/**
 * Get booking by ID
 * @param {string} bookingId - Booking ID
 * @param {string} userId - User ID (for authorization)
 * @returns {object} Booking details
 */
export const getBookingById = async (bookingId, userId) => {
    try {
        const result = await pool.query(
            `SELECT b.*, 
              c.full_name as customer_name, c.phone as customer_phone,
              m.full_name as mechanic_name, m.phone as mechanic_phone,
              mp.hourly_rate
       FROM service_bookings b
       JOIN users c ON b.customer_id = c.id
       LEFT JOIN users m ON b.mechanic_id = m.id
       LEFT JOIN mechanic_profiles mp ON m.id = mp.user_id
       WHERE b.id = $1 AND (b.customer_id = $2 OR b.mechanic_id = $2)`,
            [bookingId, userId]
        );

        if (result.rows.length === 0) {
            throw new Error('Booking not found');
        }

        return result.rows[0];
    } catch (error) {
        logger.error(`Error fetching booking: ${error.message}`);
        throw error;
    }
};

/**
 * Get user's bookings
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} Paginated bookings
 */
export const getUserBookings = async (userId, role, page = 1, limit = 20) => {
    try {
        const offset = (page - 1) * limit;
        const field = role === 'mechanic' ? 'mechanic_id' : 'customer_id';

        const result = await pool.query(
            `SELECT b.*,
              c.full_name as customer_name,
              m.full_name as mechanic_name
       FROM service_bookings b
       LEFT JOIN users c ON b.customer_id = c.id
       LEFT JOIN users m ON b.mechanic_id = m.id
       WHERE b.${field} = $1
       ORDER BY b.created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM service_bookings WHERE ${field} = $1`,
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
        logger.error(`Error fetching user bookings: ${error.message}`);
        throw error;
    }
};

/**
 * Add customer rating and review
 * @param {string} bookingId - Booking ID
 * @param {string} customerId - Customer ID
 * @param {number} rating - Rating (1-5)
 * @param {string} review - Review text
 * @returns {object} Updated booking
 */
export const addBookingReview = async (bookingId, customerId, rating, review) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            `UPDATE service_bookings 
       SET customer_rating = $1,
           customer_review = $2,
           updated_at = NOW()
       WHERE id = $3 AND customer_id = $4 AND booking_status = 'completed'
       RETURNING *`,
            [rating, review, bookingId, customerId]
        );

        if (result.rows.length === 0) {
            throw new Error('Booking not found or not completed');
        }

        const booking = result.rows[0];

        // Update mechanic's average rating
        const ratingResult = await client.query(
            `SELECT AVG(customer_rating) as avg_rating
       FROM service_bookings
       WHERE mechanic_id = $1 AND customer_rating IS NOT NULL`,
            [booking.mechanic_id]
        );

        await client.query(
            `UPDATE mechanic_profiles 
       SET rating = $1, updated_at = NOW()
       WHERE user_id = $2`,
            [parseFloat(ratingResult.rows[0].avg_rating).toFixed(2), booking.mechanic_id]
        );

        await client.query('COMMIT');
        logger.info(`Review added for booking: ${bookingId}`);

        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error(`Error adding booking review: ${error.message}`);
        throw error;
    } finally {
        client.release();
    }
};
