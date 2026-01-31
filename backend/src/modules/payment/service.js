import pool from '../../database/connection.js';
import { v4 as uuidv4 } from 'uuid';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import logger from '../../utils/logger.js';

/**
 * Payment Service with Razorpay Integration
 */

let razorpayInstance = null;

const initializeRazorpay = () => {
    if (!razorpayInstance && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
};

export const createPaymentOrder = async (userId, paymentData) => {
    try {
        const { paymentType, referenceId, amount } = paymentData;

        const razorpay = initializeRazorpay();
        if (!razorpay) {
            throw new Error('Razorpay not configured');
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
            notes: {
                userId,
                paymentType,
                referenceId
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Save payment record
        const paymentId = uuidv4();
        const result = await pool.query(
            `INSERT INTO payments (
        id, user_id, payment_type, reference_id, amount, currency,
        razorpay_order_id, payment_status
      ) VALUES ($1, $2, $3, $4, $5, 'INR', $6, 'created')
      RETURNING *`,
            [paymentId, userId, paymentType, referenceId, amount, razorpayOrder.id]
        );

        logger.info(`Payment order created: ${paymentId}`);
        return {
            payment: result.rows[0],
            razorpayOrder
        };
    } catch (error) {
        logger.error(`Error creating payment order: ${error.message}`);
        throw error;
    }
};

export const verifyPayment = async (paymentData) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

        // Verify signature
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            throw new Error('Invalid payment signature');
        }

        // Update payment record
        const result = await pool.query(
            `UPDATE payments 
       SET razorpay_payment_id = $1,
           razorpay_signature = $2,
           payment_status = 'success',
           paid_at = NOW(),
           updated_at = NOW()
       WHERE razorpay_order_id = $3
       RETURNING *`,
            [razorpayPaymentId, razorpaySignature, razorpayOrderId]
        );

        if (result.rows.length === 0) {
            throw new Error('Payment record not found');
        }

        logger.info(`Payment verified: ${result.rows[0].id}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error verifying payment: ${error.message}`);

        // Update payment status to failed
        await pool.query(
            `UPDATE payments 
       SET payment_status = 'failed',
           failure_reason = $1,
           updated_at = NOW()
       WHERE razorpay_order_id = $2`,
            [error.message, paymentData.razorpayOrderId]
        );

        throw error;
    }
};

export const getPaymentById = async (paymentId, userId) => {
    try {
        const result = await pool.query(
            `SELECT * FROM payments 
       WHERE id = $1 AND user_id = $2`,
            [paymentId, userId]
        );

        if (result.rows.length === 0) {
            throw new Error('Payment not found');
        }

        return result.rows[0];
    } catch (error) {
        logger.error(`Error fetching payment: ${error.message}`);
        throw error;
    }
};

export const getUserPayments = async (userId, page = 1, limit = 20) => {
    try {
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT * FROM payments 
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM payments WHERE user_id = $1`,
            [userId]
        );

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
        logger.error(`Error fetching user payments: ${error.message}`);
        throw error;
    }
};

export const initiateRefund = async (paymentId, amount, reason) => {
    try {
        const razorpay = initializeRazorpay();
        if (!razorpay) {
            throw new Error('Razorpay not configured');
        }

        // Get payment details
        const paymentResult = await pool.query(
            `SELECT * FROM payments WHERE id = $1 AND payment_status = 'success'`,
            [paymentId]
        );

        if (paymentResult.rows.length === 0) {
            throw new Error('Payment not found or not successful');
        }

        const payment = paymentResult.rows[0];

        // Create refund
        const refund = await razorpay.payments.refund(payment.razorpay_payment_id, {
            amount: Math.round(amount * 100),
            notes: { reason }
        });

        // Update payment record
        const result = await pool.query(
            `UPDATE payments 
       SET payment_status = 'refunded',
           refund_amount = $1,
           refunded_at = NOW(),
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
            [amount, paymentId]
        );

        logger.info(`Refund initiated for payment: ${paymentId}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error initiating refund: ${error.message}`);
        throw error;
    }
};

export const createPayout = async (payoutData) => {
    try {
        const { recipientId, recipientType, paymentId } = payoutData;

        // Get payment details
        const paymentResult = await pool.query(
            `SELECT * FROM payments WHERE id = $1 AND payment_status = 'success'`,
            [paymentId]
        );

        if (paymentResult.rows.length === 0) {
            throw new Error('Payment not found or not successful');
        }

        const payment = paymentResult.rows[0];

        // Calculate payout amounts
        const grossAmount = parseFloat(payment.amount);
        const platformCommission = grossAmount * 0.05; // 5% platform fee
        const netAmount = grossAmount - platformCommission;

        const payoutId = uuidv4();
        const result = await pool.query(
            `INSERT INTO payouts (
        id, recipient_id, recipient_type, payment_id,
        gross_amount, platform_commission, net_amount, payout_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *`,
            [payoutId, recipientId, recipientType, paymentId, grossAmount, platformCommission, netAmount]
        );

        logger.info(`Payout created: ${payoutId}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error creating payout: ${error.message}`);
        throw error;
    }
};
