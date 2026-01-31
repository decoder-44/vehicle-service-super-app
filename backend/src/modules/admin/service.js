import pool from '../../database/connection.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger.js';

/**
 * Admin Service
 * Handles admin operations, analytics, and platform management
 */

export const getDashboardStats = async () => {
    try {
        const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM users WHERE role = 'mechanic') as total_mechanics,
        (SELECT COUNT(*) FROM users WHERE role = 'merchant') as total_merchants,
        (SELECT COUNT(*) FROM users WHERE role = 'host') as total_hosts,
        (SELECT COUNT(*) FROM users WHERE kyc_status = 'approved') as verified_users,
        (SELECT COUNT(*) FROM service_bookings) as total_service_bookings,
        (SELECT COUNT(*) FROM part_orders) as total_part_orders,
        (SELECT COUNT(*) FROM rental_bookings) as total_rental_bookings,
        (SELECT COUNT(*) FROM rsa_requests) as total_rsa_requests,
        (SELECT SUM(amount) FROM payments WHERE payment_status = 'success') as total_revenue,
        (SELECT COUNT(*) FROM payments WHERE payment_status = 'success') as successful_payments,
        (SELECT COUNT(*) FROM kyc_documents WHERE status = 'pending') as pending_kyc
    `);

        return result.rows[0];
    } catch (error) {
        logger.error(`Error fetching dashboard stats: ${error.message}`);
        throw error;
    }
};

export const getAllUsers = async (filters = {}, page = 1, limit = 50) => {
    try {
        const { role, kycStatus, search } = filters;
        const offset = (page - 1) * limit;

        let query = 'SELECT id, phone, email, full_name, role, kyc_status, is_verified, created_at FROM users WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (role) {
            query += ` AND role = $${paramCount}`;
            params.push(role);
            paramCount++;
        }

        if (kycStatus) {
            query += ` AND kyc_status = $${paramCount}`;
            params.push(kycStatus);
            paramCount++;
        }

        if (search) {
            query += ` AND (full_name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR phone ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        const countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1' +
            (role ? ` AND role = '${role}'` : '') +
            (kycStatus ? ` AND kyc_status = '${kycStatus}'` : '');

        const countResult = await pool.query(countQuery);

        return {
            users: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        };
    } catch (error) {
        logger.error(`Error fetching users: ${error.message}`);
        throw error;
    }
};

export const getUserDetails = async (userId) => {
    try {
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }

        const user = userResult.rows[0];

        // Get user's addresses
        const addressesResult = await pool.query(
            'SELECT * FROM user_addresses WHERE user_id = $1',
            [userId]
        );

        // Get user's KYC documents
        const kycResult = await pool.query(
            'SELECT * FROM kyc_documents WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        // Get user's activity counts
        const activityResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM service_bookings WHERE customer_id = $1 OR mechanic_id = $1) as service_bookings_count,
        (SELECT COUNT(*) FROM part_orders WHERE customer_id = $1 OR merchant_id = $1) as part_orders_count,
        (SELECT COUNT(*) FROM rental_bookings WHERE customer_id = $1 OR host_id = $1) as rental_bookings_count,
        (SELECT COUNT(*) FROM payments WHERE user_id = $1) as payments_count
    `, [userId]);

        return {
            user,
            addresses: addressesResult.rows,
            kyc: kycResult.rows,
            activity: activityResult.rows[0]
        };
    } catch (error) {
        logger.error(`Error fetching user details: ${error.message}`);
        throw error;
    }
};

export const updateUserStatus = async (adminId, userId, isActive) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            `UPDATE users 
       SET is_active = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
            [isActive, userId]
        );

        if (result.rows.length === 0) {
            throw new Error('User not found');
        }

        // Log admin action
        await client.query(
            `INSERT INTO admin_actions (
        id, admin_id, action_type, target_entity, target_id,
        action_details, created_at
      ) VALUES ($1, $2, 'USER_STATUS_UPDATE', 'users', $3, $4, NOW())`,
            [uuidv4(), adminId, userId, JSON.stringify({ isActive })]
        );

        await client.query('COMMIT');
        logger.info(`User ${userId} status updated by admin ${adminId}`);

        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error(`Error updating user status: ${error.message}`);
        throw error;
    } finally {
        client.release();
    }
};

export const getAllBookings = async (type, page = 1, limit = 50) => {
    try {
        const offset = (page - 1) * limit;
        let query, countQuery;

        if (type === 'service') {
            query = `
        SELECT b.*, c.full_name as customer_name, m.full_name as mechanic_name
        FROM service_bookings b
        LEFT JOIN users c ON b.customer_id = c.id
        LEFT JOIN users m ON b.mechanic_id = m.id
        ORDER BY b.created_at DESC
        LIMIT $1 OFFSET $2
      `;
            countQuery = 'SELECT COUNT(*) as total FROM service_bookings';
        } else if (type === 'rental') {
            query = `
        SELECT b.*, c.full_name as customer_name, h.full_name as host_name
        FROM rental_bookings b
        LEFT JOIN users c ON b.customer_id = c.id
        LEFT JOIN users h ON b.host_id = h.id
        ORDER BY b.created_at DESC
        LIMIT $1 OFFSET $2
      `;
            countQuery = 'SELECT COUNT(*) as total FROM rental_bookings';
        } else if (type === 'parts') {
            query = `
        SELECT o.*, c.full_name as customer_name, m.full_name as merchant_name
        FROM part_orders o
        LEFT JOIN users c ON o.customer_id = c.id
        LEFT JOIN users m ON o.merchant_id = m.id
        ORDER BY o.created_at DESC
        LIMIT $1 OFFSET $2
      `;
            countQuery = 'SELECT COUNT(*) as total FROM part_orders';
        } else {
            throw new Error('Invalid booking type');
        }

        const result = await pool.query(query, [limit, offset]);
        const countResult = await pool.query(countQuery);

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
        logger.error(`Error fetching bookings: ${error.message}`);
        throw error;
    }
};

export const getAllPayments = async (page = 1, limit = 50) => {
    try {
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT p.*, u.full_name as user_name, u.email
       FROM payments p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await pool.query('SELECT COUNT(*) as total FROM payments');

        return {
            payments: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        };
    } catch (error) {
        logger.error(`Error fetching payments: ${error.message}`);
        throw error;
    }
};

export const getRevenueAnalytics = async (startDate, endDate) => {
    try {
        const result = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        SUM(CASE WHEN payment_status = 'success' THEN amount ELSE 0 END) as successful_amount,
        COUNT(CASE WHEN payment_status = 'success' THEN 1 END) as successful_count
      FROM payments
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [startDate, endDate]);

        return result.rows;
    } catch (error) {
        logger.error(`Error fetching revenue analytics: ${error.message}`);
        throw error;
    }
};

export const getAdminActions = async (adminId = null, page = 1, limit = 50) => {
    try {
        const offset = (page - 1) * limit;

        let query = `
      SELECT a.*, u.full_name as admin_name
      FROM admin_actions a
      JOIN users u ON a.admin_id = u.id
    `;

        const params = [limit, offset];

        if (adminId) {
            query += ' WHERE a.admin_id = $3';
            params.push(adminId);
        }

        query += ' ORDER BY a.created_at DESC LIMIT $1 OFFSET $2';

        const result = await pool.query(query, params);

        const countQuery = adminId
            ? 'SELECT COUNT(*) as total FROM admin_actions WHERE admin_id = $1'
            : 'SELECT COUNT(*) as total FROM admin_actions';

        const countResult = await pool.query(
            countQuery,
            adminId ? [adminId] : []
        );

        return {
            actions: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        };
    } catch (error) {
        logger.error(`Error fetching admin actions: ${error.message}`);
        throw error;
    }
};

export const logAdminAction = async (adminId, actionType, targetEntity, targetId, actionDetails, notes = null) => {
    try {
        const actionId = uuidv4();
        const result = await pool.query(
            `INSERT INTO admin_actions (
        id, admin_id, action_type, target_entity, target_id,
        action_details, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
            [
                actionId,
                adminId,
                actionType,
                targetEntity,
                targetId,
                JSON.stringify(actionDetails),
                notes
            ]
        );

        return result.rows[0];
    } catch (error) {
        logger.error(`Error logging admin action: ${error.message}`);
        throw error;
    }
};
