import pool from '../../database/connection.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger.js';

/**
 * Rental Service
 * Handles vehicle rental listings and bookings
 */

export const createRentalVehicle = async (hostId, vehicleData) => {
    try {
        const {
            vehicleType, brand, model, yearOfManufacture, registrationNumber,
            vehicleImages, documentUrls, seatingCapacity, fuelType, transmission,
            pricePerDay, isInsuranceEligible, currentLocationLat, currentLocationLng,
            currentLocationCity
        } = vehicleData;

        const vehicleId = uuidv4();
        const result = await pool.query(
            `INSERT INTO rental_vehicles (
        id, host_id, vehicle_type, brand, model, year_of_manufacture,
        registration_number, vehicle_images, document_urls, seating_capacity,
        fuel_type, transmission, price_per_day, is_insurance_eligible,
        current_location_lat, current_location_lng, current_location_city,
        is_available
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, true)
      RETURNING *`,
            [
                vehicleId, hostId, vehicleType, brand, model, yearOfManufacture,
                registrationNumber, JSON.stringify(vehicleImages), JSON.stringify(documentUrls),
                seatingCapacity, fuelType, transmission, pricePerDay, isInsuranceEligible,
                currentLocationLat, currentLocationLng, currentLocationCity
            ]
        );

        await pool.query(
            `UPDATE users SET role = 'host', updated_at = NOW() WHERE id = $1 AND role = 'customer'`,
            [hostId]
        );

        logger.info(`Rental vehicle created: ${vehicleId}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error creating rental vehicle: ${error.message}`);
        throw error;
    }
};

export const getAllRentalVehicles = async (filters = {}, page = 1, limit = 20) => {
    try {
        const { vehicleType, city, minPrice, maxPrice, search } = filters;
        const offset = (page - 1) * limit;

        let query = `
      SELECT v.*, u.full_name as host_name, u.phone as host_phone
      FROM rental_vehicles v
      JOIN users u ON v.host_id = u.id
      WHERE v.is_available = true
    `;

        const params = [];
        let paramCount = 1;

        if (vehicleType) {
            query += ` AND v.vehicle_type = $${paramCount}`;
            params.push(vehicleType);
            paramCount++;
        }

        if (city) {
            query += ` AND v.current_location_city ILIKE $${paramCount}`;
            params.push(`%${city}%`);
            paramCount++;
        }

        if (minPrice) {
            query += ` AND v.price_per_day >= $${paramCount}`;
            params.push(minPrice);
            paramCount++;
        }

        if (maxPrice) {
            query += ` AND v.price_per_day <= $${paramCount}`;
            params.push(maxPrice);
            paramCount++;
        }

        if (search) {
            query += ` AND (v.brand ILIKE $${paramCount} OR v.model ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        query += ` ORDER BY v.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        const countQuery = `SELECT COUNT(*) as total FROM rental_vehicles WHERE is_available = true`;
        const countResult = await pool.query(countQuery);

        return {
            vehicles: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        };
    } catch (error) {
        logger.error(`Error fetching rental vehicles: ${error.message}`);
        throw error;
    }
};

export const getVehicleById = async (vehicleId) => {
    try {
        const result = await pool.query(
            `SELECT v.*, u.full_name as host_name, u.phone as host_phone, u.email as host_email
       FROM rental_vehicles v
       JOIN users u ON v.host_id = u.id
       WHERE v.id = $1 AND v.is_available = true`,
            [vehicleId]
        );

        if (result.rows.length === 0) {
            throw new Error('Vehicle not found');
        }

        return result.rows[0];
    } catch (error) {
        logger.error(`Error fetching vehicle: ${error.message}`);
        throw error;
    }
};

export const updateRentalVehicle = async (vehicleId, hostId, vehicleData) => {
    try {
        const {
            pricePerDay, isAvailable, vehicleImages, currentLocationLat,
            currentLocationLng, currentLocationCity
        } = vehicleData;

        const result = await pool.query(
            `UPDATE rental_vehicles 
       SET price_per_day = COALESCE($1, price_per_day),
           is_available = COALESCE($2, is_available),
           vehicle_images = COALESCE($3, vehicle_images),
           current_location_lat = COALESCE($4, current_location_lat),
           current_location_lng = COALESCE($5, current_location_lng),
           current_location_city = COALESCE($6, current_location_city),
           updated_at = NOW()
       WHERE id = $7 AND host_id = $8
       RETURNING *`,
            [
                pricePerDay, isAvailable,
                vehicleImages ? JSON.stringify(vehicleImages) : null,
                currentLocationLat, currentLocationLng, currentLocationCity,
                vehicleId, hostId
            ]
        );

        if (result.rows.length === 0) {
            throw new Error('Vehicle not found or unauthorized');
        }

        return result.rows[0];
    } catch (error) {
        logger.error(`Error updating rental vehicle: ${error.message}`);
        throw error;
    }
};

export const createRentalBooking = async (customerId, bookingData) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const {
            vehicleId, startDate, endDate, pickupLocation, insuranceRequired
        } = bookingData;

        // Get vehicle details
        const vehicleResult = await client.query(
            'SELECT * FROM rental_vehicles WHERE id = $1 AND is_available = true',
            [vehicleId]
        );

        if (vehicleResult.rows.length === 0) {
            throw new Error('Vehicle not available');
        }

        const vehicle = vehicleResult.rows[0];

        // Calculate booking details
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        if (totalDays < 1) {
            throw new Error('Invalid booking dates');
        }

        const subtotal = vehicle.price_per_day * totalDays;
        const platformCommission = subtotal * 0.1; // 10% commission
        const insuranceFee = insuranceRequired && vehicle.is_insurance_eligible ? subtotal * 0.05 : 0;
        const totalAmount = subtotal + platformCommission + insuranceFee;

        const bookingId = uuidv4();
        const bookingNumber = `RNT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const result = await client.query(
            `INSERT INTO rental_bookings (
        id, booking_number, customer_id, vehicle_id, host_id,
        start_date, end_date, total_days, price_per_day, subtotal,
        platform_commission, insurance_fee, total_amount, booking_status,
        pickup_location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending', $14)
      RETURNING *`,
            [
                bookingId, bookingNumber, customerId, vehicleId, vehicle.host_id,
                startDate, endDate, totalDays, vehicle.price_per_day, subtotal,
                platformCommission, insuranceFee, totalAmount, pickupLocation
            ]
        );

        await client.query('COMMIT');
        logger.info(`Rental booking created: ${bookingId}`);

        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error(`Error creating rental booking: ${error.message}`);
        throw error;
    } finally {
        client.release();
    }
};

export const getRentalBookingById = async (bookingId, userId) => {
    try {
        const result = await pool.query(
            `SELECT b.*, v.brand, v.model, v.registration_number,
              c.full_name as customer_name, h.full_name as host_name
       FROM rental_bookings b
       JOIN rental_vehicles v ON b.vehicle_id = v.id
       JOIN users c ON b.customer_id = c.id
       JOIN users h ON b.host_id = h.id
       WHERE b.id = $1 AND (b.customer_id = $2 OR b.host_id = $2)`,
            [bookingId, userId]
        );

        if (result.rows.length === 0) {
            throw new Error('Booking not found');
        }

        return result.rows[0];
    } catch (error) {
        logger.error(`Error fetching rental booking: ${error.message}`);
        throw error;
    }
};

export const updateRentalBookingStatus = async (bookingId, userId, status, additionalData = {}) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { cancellationReason, dropoffLocation } = additionalData;

        let updateQuery = `
      UPDATE rental_bookings 
      SET booking_status = $1,
          cancellation_reason = COALESCE($2, cancellation_reason),
          dropoff_location = COALESCE($3, dropoff_location),
    `;

        if (status === 'accepted') {
            updateQuery += 'vehicle_picked_up_at = NOW(),';
        } else if (status === 'completed') {
            updateQuery += 'vehicle_returned_at = NOW(),';
        }

        updateQuery += `
          updated_at = NOW()
       WHERE id = $4 AND (customer_id = $5 OR host_id = $5)
       RETURNING *
    `;

        const result = await client.query(updateQuery, [
            status, cancellationReason, dropoffLocation, bookingId, userId
        ]);

        if (result.rows.length === 0) {
            throw new Error('Booking not found or unauthorized');
        }

        // Update vehicle stats if completed
        if (status === 'completed') {
            const booking = result.rows[0];
            await client.query(
                `UPDATE rental_vehicles 
         SET total_bookings = total_bookings + 1,
             updated_at = NOW()
         WHERE id = $1`,
                [booking.vehicle_id]
            );
        }

        await client.query('COMMIT');
        logger.info(`Rental booking ${bookingId} status updated to ${status}`);

        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error(`Error updating rental booking status: ${error.message}`);
        throw error;
    } finally {
        client.release();
    }
};

export const getUserRentalBookings = async (userId, role, page = 1, limit = 20) => {
    try {
        const offset = (page - 1) * limit;
        const field = role === 'host' ? 'host_id' : 'customer_id';

        const result = await pool.query(
            `SELECT b.*, v.brand, v.model, v.registration_number
       FROM rental_bookings b
       JOIN rental_vehicles v ON b.vehicle_id = v.id
       WHERE b.${field} = $1
       ORDER BY b.created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM rental_bookings WHERE ${field} = $1`,
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
        logger.error(`Error fetching rental bookings: ${error.message}`);
        throw error;
    }
};
