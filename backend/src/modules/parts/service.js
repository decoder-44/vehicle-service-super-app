import pool from '../../database/connection.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger.js';

/**
 * Parts Marketplace Service
 * Handles vehicle parts listing, ordering, and management
 */

/**
 * Create a new vehicle part listing
 * @param {string} merchantId - Merchant user ID
 * @param {object} data - Part data
 * @returns {object} Created part
 */
export const createPartListing = async (merchantId, data) => {
    try {
        const {
            name, description, vehicleType, category, brand, model,
            price, stockQuantity, sku, images, specifications
        } = data;

        const partId = uuidv4();
        const result = await pool.query(
            `INSERT INTO vehicle_parts (
        id, merchant_id, name, description, vehicle_type, category,
        brand, model, price, stock_quantity, sku, images, 
        specifications, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
      RETURNING *`,
            [
                partId, merchantId, name, description, vehicleType, category,
                brand, model, price, stockQuantity, sku,
                JSON.stringify(images), JSON.stringify(specifications)
            ]
        );

        logger.info(`Part listing created: ${partId} by merchant: ${merchantId}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error creating part listing: ${error.message}`);
        throw error;
    }
};

/**
 * Get all parts with filters
 * @param {object} filters - Search filters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} Paginated parts list
 */
export const getAllParts = async (filters = {}, page = 1, limit = 20) => {
    try {
        const { vehicleType, category, search, merchantId, minPrice, maxPrice } = filters;
        const offset = (page - 1) * limit;

        let query = `
      SELECT p.*, u.full_name as merchant_name, u.phone as merchant_phone
      FROM vehicle_parts p
      JOIN users u ON p.merchant_id = u.id
      WHERE p.is_active = true
    `;

        const params = [];
        let paramCount = 1;

        if (vehicleType) {
            query += ` AND p.vehicle_type = $${paramCount}`;
            params.push(vehicleType);
            paramCount++;
        }

        if (category) {
            query += ` AND p.category = $${paramCount}`;
            params.push(category);
            paramCount++;
        }

        if (merchantId) {
            query += ` AND p.merchant_id = $${paramCount}`;
            params.push(merchantId);
            paramCount++;
        }

        if (search) {
            query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        if (minPrice) {
            query += ` AND p.price >= $${paramCount}`;
            params.push(minPrice);
            paramCount++;
        }

        if (maxPrice) {
            query += ` AND p.price <= $${paramCount}`;
            params.push(maxPrice);
            paramCount++;
        }

        query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count for pagination
        let countQuery = `SELECT COUNT(*) as total FROM vehicle_parts p WHERE p.is_active = true`;
        const countParams = [];
        let countParamNum = 1;

        if (vehicleType) {
            countQuery += ` AND p.vehicle_type = $${countParamNum}`;
            countParams.push(vehicleType);
            countParamNum++;
        }

        if (category) {
            countQuery += ` AND p.category = $${countParamNum}`;
            countParams.push(category);
            countParamNum++;
        }

        if (merchantId) {
            countQuery += ` AND p.merchant_id = $${countParamNum}`;
            countParams.push(merchantId);
            countParamNum++;
        }

        const countResult = await pool.query(countQuery, countParams);

        return {
            parts: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        };
    } catch (error) {
        logger.error(`Error fetching parts: ${error.message}`);
        throw error;
    }
};

/**
 * Get part by ID
 * @param {string} partId - Part ID
 * @returns {object} Part details
 */
export const getPartById = async (partId) => {
    try {
        const result = await pool.query(
            `SELECT p.*, u.full_name as merchant_name, u.email as merchant_email, 
              u.phone as merchant_phone
       FROM vehicle_parts p
       JOIN users u ON p.merchant_id = u.id
       WHERE p.id = $1 AND p.is_active = true`,
            [partId]
        );

        if (result.rows.length === 0) {
            throw new Error('Part not found');
        }

        return result.rows[0];
    } catch (error) {
        logger.error(`Error fetching part: ${error.message}`);
        throw error;
    }
};

/**
 * Update part listing
 * @param {string} partId - Part ID
 * @param {string} merchantId - Merchant ID (for authorization)
 * @param {object} data - Updated part data
 * @returns {object} Updated part
 */
export const updatePartListing = async (partId, merchantId, data) => {
    try {
        const {
            name, description, price, stockQuantity, images,
            specifications, isActive
        } = data;

        const result = await pool.query(
            `UPDATE vehicle_parts 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           stock_quantity = COALESCE($4, stock_quantity),
           images = COALESCE($5, images),
           specifications = COALESCE($6, specifications),
           is_active = COALESCE($7, is_active),
           updated_at = NOW()
       WHERE id = $8 AND merchant_id = $9
       RETURNING *`,
            [
                name, description, price, stockQuantity,
                images ? JSON.stringify(images) : null,
                specifications ? JSON.stringify(specifications) : null,
                isActive, partId, merchantId
            ]
        );

        if (result.rows.length === 0) {
            throw new Error('Part not found or unauthorized');
        }

        logger.info(`Part updated: ${partId}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error updating part: ${error.message}`);
        throw error;
    }
};

/**
 * Delete part listing
 * @param {string} partId - Part ID
 * @param {string} merchantId - Merchant ID (for authorization)
 * @returns {boolean} Success status
 */
export const deletePartListing = async (partId, merchantId) => {
    try {
        const result = await pool.query(
            `UPDATE vehicle_parts 
       SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND merchant_id = $2
       RETURNING id`,
            [partId, merchantId]
        );

        if (result.rows.length === 0) {
            throw new Error('Part not found or unauthorized');
        }

        logger.info(`Part deleted: ${partId}`);
        return true;
    } catch (error) {
        logger.error(`Error deleting part: ${error.message}`);
        throw error;
    }
};

/**
 * Create part order
 * @param {string} customerId - Customer ID
 * @param {object} orderData - Order data
 * @returns {object} Created order
 */
export const createPartOrder = async (customerId, orderData) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { items, deliveryAddressId } = orderData;

        // Validate items and calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const partResult = await client.query(
                'SELECT * FROM vehicle_parts WHERE id = $1 AND is_active = true',
                [item.partId]
            );

            if (partResult.rows.length === 0) {
                throw new Error(`Part not found: ${item.partId}`);
            }

            const part = partResult.rows[0];

            if (part.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for part: ${part.name}`);
            }

            const totalPrice = part.price * item.quantity;
            subtotal += totalPrice;

            orderItems.push({
                partId: item.partId,
                merchantId: part.merchant_id,
                quantity: item.quantity,
                unitPrice: part.price,
                totalPrice
            });
        }

        // Calculate charges
        const platformCommission = subtotal * 0.05; // 5% commission
        const taxAmount = subtotal * 0.18; // 18% GST
        const deliveryCharge = 50; // Flat delivery charge
        const totalAmount = subtotal + platformCommission + taxAmount + deliveryCharge;

        // Group items by merchant
        const merchantGroups = {};
        orderItems.forEach(item => {
            if (!merchantGroups[item.merchantId]) {
                merchantGroups[item.merchantId] = [];
            }
            merchantGroups[item.merchantId].push(item);
        });

        // Create separate orders for each merchant
        const createdOrders = [];

        for (const [merchantId, merchantItems] of Object.entries(merchantGroups)) {
            const merchantSubtotal = merchantItems.reduce((sum, item) => sum + item.totalPrice, 0);
            const merchantCommission = merchantSubtotal * 0.05;
            const merchantTax = merchantSubtotal * 0.18;
            const merchantTotal = merchantSubtotal + merchantCommission + merchantTax + deliveryCharge;

            const orderId = uuidv4();
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            const orderResult = await client.query(
                `INSERT INTO part_orders (
          id, order_number, customer_id, merchant_id, delivery_address_id,
          subtotal, platform_commission, tax_amount, delivery_charge, 
          total_amount, order_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
        RETURNING *`,
                [
                    orderId, orderNumber, customerId, merchantId, deliveryAddressId,
                    merchantSubtotal, merchantCommission, merchantTax, deliveryCharge,
                    merchantTotal
                ]
            );

            // Insert order items
            for (const item of merchantItems) {
                await client.query(
                    `INSERT INTO part_order_items (
            id, order_id, part_id, quantity, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
                    [uuidv4(), orderId, item.partId, item.quantity, item.unitPrice, item.totalPrice]
                );

                // Update stock
                await client.query(
                    `UPDATE vehicle_parts 
           SET stock_quantity = stock_quantity - $1, updated_at = NOW()
           WHERE id = $2`,
                    [item.quantity, item.partId]
                );
            }

            createdOrders.push(orderResult.rows[0]);
        }

        await client.query('COMMIT');
        logger.info(`Part orders created for customer: ${customerId}`);

        return createdOrders;
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error(`Error creating part order: ${error.message}`);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (for authorization)
 * @returns {object} Order details with items
 */
export const getOrderById = async (orderId, userId) => {
    try {
        const orderResult = await pool.query(
            `SELECT o.*, a.address_line1, a.address_line2, a.city, a.state, a.pincode
       FROM part_orders o
       LEFT JOIN user_addresses a ON o.delivery_address_id = a.id
       WHERE o.id = $1 AND (o.customer_id = $2 OR o.merchant_id = $2)`,
            [orderId, userId]
        );

        if (orderResult.rows.length === 0) {
            throw new Error('Order not found');
        }

        const order = orderResult.rows[0];

        // Get order items
        const itemsResult = await pool.query(
            `SELECT oi.*, p.name as part_name, p.images
       FROM part_order_items oi
       JOIN vehicle_parts p ON oi.part_id = p.id
       WHERE oi.order_id = $1`,
            [orderId]
        );

        order.items = itemsResult.rows;

        return order;
    } catch (error) {
        logger.error(`Error fetching order: ${error.message}`);
        throw error;
    }
};

/**
 * Get user's orders
 * @param {string} userId - User ID
 * @param {string} role - User role ('customer' or 'merchant')
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} Paginated orders
 */
export const getUserOrders = async (userId, role, page = 1, limit = 20) => {
    try {
        const offset = (page - 1) * limit;
        const field = role === 'merchant' ? 'merchant_id' : 'customer_id';

        const result = await pool.query(
            `SELECT o.*, 
              COALESCE(json_agg(
                json_build_object(
                  'id', oi.id,
                  'part_name', p.name,
                  'quantity', oi.quantity,
                  'unit_price', oi.unit_price,
                  'total_price', oi.total_price
                )
              ) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
       FROM part_orders o
       LEFT JOIN part_order_items oi ON o.id = oi.order_id
       LEFT JOIN vehicle_parts p ON oi.part_id = p.id
       WHERE o.${field} = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM part_orders WHERE ${field} = $1`,
            [userId]
        );

        return {
            orders: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        };
    } catch (error) {
        logger.error(`Error fetching user orders: ${error.message}`);
        throw error;
    }
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} merchantId - Merchant ID (for authorization)
 * @param {string} status - New status
 * @param {object} additionalData - Additional data (tracking number, etc.)
 * @returns {object} Updated order
 */
export const updateOrderStatus = async (orderId, merchantId, status, additionalData = {}) => {
    try {
        const { trackingNumber, estimatedDelivery, cancellationReason } = additionalData;

        const result = await pool.query(
            `UPDATE part_orders 
       SET order_status = $1,
           tracking_number = COALESCE($2, tracking_number),
           estimated_delivery = COALESCE($3, estimated_delivery),
           cancellation_reason = COALESCE($4, cancellation_reason),
           delivered_at = CASE WHEN $1 = 'delivered' THEN NOW() ELSE delivered_at END,
           updated_at = NOW()
       WHERE id = $5 AND merchant_id = $6
       RETURNING *`,
            [status, trackingNumber, estimatedDelivery, cancellationReason, orderId, merchantId]
        );

        if (result.rows.length === 0) {
            throw new Error('Order not found or unauthorized');
        }

        logger.info(`Order status updated: ${orderId} to ${status}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error updating order status: ${error.message}`);
        throw error;
    }
};
