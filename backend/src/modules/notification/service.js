import pool from '../../database/connection.js';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import logger from '../../utils/logger.js';

/**
 * Notification Service
 * Supports email, SMS, and in-app notifications
 */

let emailTransporter = null;

const initializeEmailTransporter = () => {
    if (!emailTransporter && process.env.SMTP_HOST) {
        emailTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return emailTransporter;
};

export const createNotification = async (userId, notificationData) => {
    try {
        const { type, channel, title, message, data } = notificationData;

        const notificationId = uuidv4();
        const result = await pool.query(
            `INSERT INTO notifications (
        id, user_id, type, channel, title, message, data, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *`,
            [
                notificationId,
                userId,
                type,
                channel,
                title,
                message,
                data ? JSON.stringify(data) : null
            ]
        );

        // Send notification based on channel
        if (channel === 'email') {
            await sendEmailNotification(userId, title, message);
        } else if (channel === 'sms') {
            await sendSMSNotification(userId, message);
        }

        // Mark as sent
        await pool.query(
            `UPDATE notifications SET status = 'sent', sent_at = NOW() WHERE id = $1`,
            [notificationId]
        );

        logger.info(`Notification created: ${notificationId}`);
        return result.rows[0];
    } catch (error) {
        logger.error(`Error creating notification: ${error.message}`);

        // Mark as failed if notification was created
        if (notificationData.id) {
            await pool.query(
                `UPDATE notifications SET status = 'failed' WHERE id = $1`,
                [notificationData.id]
            );
        }

        throw error;
    }
};

const sendEmailNotification = async (userId, subject, message) => {
    try {
        // Get user email
        const userResult = await pool.query(
            'SELECT email, full_name FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0 || !userResult.rows[0].email) {
            throw new Error('User email not found');
        }

        const user = userResult.rows[0];
        const transporter = initializeEmailTransporter();

        if (!transporter) {
            logger.warn('Email transporter not configured');
            return;
        }

        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@vehicleapp.com',
            to: user.email,
            subject,
            html: `
        <h2>Hello ${user.full_name},</h2>
        <p>${message}</p>
        <br>
        <p>Best regards,<br>Vehicle Super App Team</p>
      `
        });

        logger.info(`Email sent to user: ${userId}`);
    } catch (error) {
        logger.error(`Error sending email: ${error.message}`);
        throw error;
    }
};

const sendSMSNotification = async (userId, message) => {
    try {
        // Get user phone
        const userResult = await pool.query(
            'SELECT phone FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0 || !userResult.rows[0].phone) {
            throw new Error('User phone not found');
        }

        // TODO: Integrate with SMS provider (Twilio/MSG91)
        logger.info(`SMS would be sent to user: ${userId}`);
        // For now, just log the message
        logger.info(`SMS Message: ${message}`);
    } catch (error) {
        logger.error(`Error sending SMS: ${error.message}`);
        throw error;
    }
};

export const getUserNotifications = async (userId, page = 1, limit = 20) => {
    try {
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT * FROM notifications 
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM notifications WHERE user_id = $1`,
            [userId]
        );

        return {
            notifications: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        };
    } catch (error) {
        logger.error(`Error fetching notifications: ${error.message}`);
        throw error;
    }
};

export const markNotificationAsRead = async (notificationId, userId) => {
    try {
        const result = await pool.query(
            `UPDATE notifications 
       SET data = jsonb_set(COALESCE(data, '{}'), '{read}', 'true')
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
            [notificationId, userId]
        );

        if (result.rows.length === 0) {
            throw new Error('Notification not found');
        }

        return result.rows[0];
    } catch (error) {
        logger.error(`Error marking notification as read: ${error.message}`);
        throw error;
    }
};

export const sendBulkNotifications = async (userIds, notificationData) => {
    try {
        const notifications = [];

        for (const userId of userIds) {
            const notification = await createNotification(userId, notificationData);
            notifications.push(notification);
        }

        logger.info(`Bulk notifications sent to ${userIds.length} users`);
        return notifications;
    } catch (error) {
        logger.error(`Error sending bulk notifications: ${error.message}`);
        throw error;
    }
};
