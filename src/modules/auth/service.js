import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../database/connection.js';
import logger from '../../utils/logger.js';

const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Generate and send OTP
 */
export const sendOTP = async (phone) => {
  try {
    const otpId = uuidv4();
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_TIME);

    // Store OTP in database (using a temporary otp_store table)
    await query(
      `INSERT INTO otp_store (id, phone, otp, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (phone) DO UPDATE
       SET otp = $3, expires_at = $4`,
      [otpId, phone, otp, expiresAt]
    );

    // TODO: Send OTP via SMS provider (Twilio/MSG91)
    logger.info(`OTP generated for phone: ${phone} (Dev: ${otp})`);

    return { otpId, message: 'OTP sent successfully' };
  } catch (error) {
    logger.error('Error sending OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP and login/register user
 */
export const verifyOTP = async (phone, otp, otpId) => {
  try {
    // Fetch stored OTP
    const result = await query(
      `SELECT * FROM otp_store WHERE phone = $1 AND id = $2`,
      [phone, otpId]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid OTP or OTP ID');
    }

    const storedOtpRecord = result.rows[0];

    // Check OTP expiry
    if (new Date() > new Date(storedOtpRecord.expires_at)) {
      throw new Error('OTP has expired');
    }

    // Verify OTP
    if (storedOtpRecord.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    // Delete used OTP
    await query(`DELETE FROM otp_store WHERE id = $1`, [otpId]);

    // Check if user exists
    let user = await getUserByPhone(phone);

    // If user doesn't exist, create one
    if (!user) {
      user = await createUserWithPhone(phone);
    }

    // Generate JWT token
    const token = generateJWT(user);

    return { token, user };
  } catch (error) {
    logger.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Register user with email and password
 */
export const registerUser = async (email, password, fullName, phone = null) => {
  try {
    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const userId = uuidv4();
    const passwordHash = await hashPassword(password);

    const result = await query(
      `INSERT INTO users (id, email, password_hash, full_name, phone, role, is_verified, kyc_status, created_at, updated_at, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), true)
       RETURNING *`,
      [userId, email, passwordHash, fullName, phone, 'customer', false, 'pending']
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = generateJWT(user);

    return { token, user };
  } catch (error) {
    logger.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Login user with email and password
 */
export const loginUser = async (email, password) => {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateJWT(user);

    return { token, user };
  } catch (error) {
    logger.error('Error logging in user:', error);
    throw error;
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET + '_email_verification');

    await query(
      `UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = $1`,
      [decoded.userId]
    );

    return { message: 'Email verified successfully' };
  } catch (error) {
    logger.error('Error verifying email:', error);
    throw new Error('Invalid or expired verification token');
  }
};

/**
 * Helper: Get user by email
 */
export const getUserByEmail = async (email) => {
  try {
    const result = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error fetching user by email:', error);
    throw error;
  }
};

/**
 * Helper: Get user by phone
 */
export const getUserByPhone = async (phone) => {
  try {
    const result = await query(`SELECT * FROM users WHERE phone = $1`, [phone]);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error fetching user by phone:', error);
    throw error;
  }
};

/**
 * Helper: Get user by ID
 */
export const getUserById = async (userId) => {
  try {
    const result = await query(`SELECT * FROM users WHERE id = $1`, [userId]);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error fetching user by ID:', error);
    throw error;
  }
};

/**
 * Helper: Create user with phone
 */
const createUserWithPhone = async (phone) => {
  try {
    const userId = uuidv4();
    const result = await query(
      `INSERT INTO users (id, phone, full_name, role, is_verified, kyc_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [userId, phone, '', 'customer', true, 'pending']
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Error creating user with phone:', error);
    throw error;
  }
};

/**
 * Helper: Hash password
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

/**
 * Helper: Generate JWT token
 */
export const generateJWT = (user) => {
  const payload = {
    user_id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    kyc_status: user.kyc_status,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

export default {
  sendOTP,
  verifyOTP,
  registerUser,
  loginUser,
  verifyEmail,
  getUserByEmail,
  getUserByPhone,
  getUserById,
  generateJWT,
};
