import pool from "../../database/connection.js";
import bcrypt from "bcrypt";
import logger from "../../utils/logger.js";
import { ERROR_CODES } from "../../errors/errorCodes.js";
import { STATUS_CODES } from "./constants.js";
import { CustomError } from "../../errors/customError.js";

/**
 * User Service - Phase 1.5
 * Handles user profile management, addresses, and account operations
 */

/**
 * Get user profile by ID
 * @param {number} userId - User ID
 * @returns {object} User profile without sensitive data
 */
export const getUserProfile = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT id, phone, email, full_name, role, kyc_status, profile_image_url, 
              created_at, updated_at 
       FROM users WHERE id = $1 AND is_active = true`,
      [userId],
    );

    if (result.rows.length === 0) {
      const errorObj = {
        code: ERROR_CODES.USER_NOT_FOUND,
        data: { userId },
        statusCode: STATUS_CODES.ERROR,
      };
      throw new CustomError(errorObj);
    }

    return result.rows[0];
  } catch (error) {
    logger.error(`Error fetching user profile: ${error.message}`);
    const errorObj = {
      code: error.code || ERROR_CODES.GET_USER_PROFILE_INFO_ERROR,
      data: { userId },
      statusCode: STATUS_CODES.ERROR,
    };
    throw new CustomError(errorObj);
  }
};

/**
 * Update user profile
 * @param {number} userId - User ID
 * @param {object} data - Profile data to update
 * @returns {object} Updated user profile
 */
export const updateUserProfile = async (userId, data) => {
  try {
    const { fullName, profilePictureUrl, phone } = data;

    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           profile_image_url = COALESCE($2, profile_image_url),
           phone = COALESCE($3, phone),
           updated_at = NOW()
       WHERE id = $4 AND is_active = true
       RETURNING id, phone, email, full_name, role, kyc_status, profile_image_url, updated_at`,
      [fullName, profilePictureUrl, phone, userId],
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    logger.info(`User profile updated: ${userId}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error updating user profile: ${error.message}`);
    throw error;
  }
};

/**
 * Change user password
 * @param {number} userId - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {boolean} Success status
 */
export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    // Get current password hash
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1 AND is_active = true",
      [userId],
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    // Verify old password
    const isValid = await bcrypt.compare(
      oldPassword,
      result.rows[0].password_hash,
    );
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [passwordHash, userId],
    );

    logger.info(`Password changed for user: ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Error changing password: ${error.message}`);
    throw error;
  }
};

/**
 * Deactivate user account
 * @param {number} userId - User ID
 * @returns {boolean} Success status
 */
export const deactivateAccount = async (userId) => {
  try {
    const result = await pool.query(
      "UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id",
      [userId],
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    logger.info(`User account deactivated: ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Error deactivating account: ${error.message}`);
    throw error;
  }
};

/**
 * Add user address
 * @param {number} userId - User ID
 * @param {object} data - Address data
 * @returns {object} Created address
 */
export const addAddress = async (userId, data) => {
  try {
    const {
      address_line1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      type,
      isDefault,
    } = data;

    // If marking as default, unmark previous defaults
    if (isDefault) {
      await pool.query(
        "UPDATE user_addresses SET is_default = false WHERE user_id = $1 AND type = $2",
        [userId, type],
      );
    }

    const result = await pool.query(
      `INSERT INTO user_addresses 
   (user_id, address_line1, address_line2, city, state, zip_code, country, type, is_default)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
   RETURNING id, user_id, address_line1, address_line2, city, state, zip_code, country, type, is_default, created_at`,
      [
        userId,
        address_line1,
        addressLine2 || null,
        city,
        state,
        zipCode,
        country,
        type,
        isDefault ?? false,
      ],
    );

    logger.info(`Address added for user: ${userId}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error adding address: ${error.message}`);
    throw error;
  }
};

/**
 * Get all addresses for user
 * @param {number} userId - User ID
 * @returns {array} User addresses
 */
export const getUserAddresses = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT 
      id, 
      user_id, 
      address_line1, 
      address_line2, 
      city, 
      state, 
      zip_code, 
      country, 
      type, 
      is_default, 
      created_at, 
      updated_at
   FROM user_addresses 
   WHERE user_id = $1 
   ORDER BY is_default DESC NULLS LAST, created_at DESC`,
      [userId],
    );

    return result.rows;
  } catch (error) {
    logger.error(`Error fetching addresses: ${error.message}`);
    throw error;
  }
};

/**
 * Update user address
 * @param {number} userId - User ID
 * @param {number} addressId - Address ID
 * @param {object} data - Updated address data
 * @returns {object} Updated address
 */
export const updateAddress = async (userId, addressId, data) => {
  try {
    const { address_line1, city, state, zipCode, country, type, isDefault } =
      data;

    // If marking as default, unmark previous defaults of same type
    if (isDefault) {
      await pool.query(
        "UPDATE user_addresses SET is_default = false WHERE user_id = $1 AND type = $2 AND id != $3",
        [userId, type, addressId],
      );
    }

    const result = await pool.query(
      `UPDATE user_addresses 
       SET address_line1 = COALESCE($1, address_line1),
           city = COALESCE($2, city),
           state = COALESCE($3, state),
           zip_code = COALESCE($4, zip_code),
           country = COALESCE($5, country),
           type = COALESCE($6, type),
           is_default = COALESCE($7, is_default),
           updated_at = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING id, user_id, address_line1, city, state, zip_code, country, type, is_default, updated_at`,
      [
        address_line1,
        city,
        state,
        zipCode,
        country,
        type,
        isDefault,
        addressId,
        userId,
      ],
    );

    if (result.rows.length === 0) {
      throw new Error("Address not found");
    }

    logger.info(`Address updated: ${addressId}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error updating address: ${error.message}`);
    throw error;
  }
};

/**
 * Delete user address
 * @param {number} userId - User ID
 * @param {number} addressId - Address ID
 * @returns {boolean} Success status
 */
export const deleteAddress = async (userId, addressId) => {
  try {
    const result = await pool.query(
      "DELETE FROM user_addresses WHERE id = $1 AND user_id = $2 RETURNING id",
      [addressId, userId],
    );

    if (result.rows.length === 0) {
      throw new Error("Address not found");
    }

    logger.info(`Address deleted: ${addressId}`);
    return true;
  } catch (error) {
    logger.error(`Error deleting address: ${error.message}`);
    throw error;
  }
};

/**
 * Convert user role (customer -> merchant/mechanic/host)
 * @param {number} userId - User ID
 * @param {string} newRole - New role (merchant, mechanic, rental_host)
 * @returns {object} Updated user
 */
export const convertUserRole = async (userId, newRole) => {
  try {
    const validRoles = [
      "customer",
      "merchant",
      "mechanic",
      "rental_host",
      "cleaning_partner",
      "admin",
    ];

    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}`);
    }

    const result = await pool.query(
      `UPDATE users 
       SET role = $1, updated_at = NOW()
       WHERE id = $2 AND is_active = true
       RETURNING id, phone, email, full_name, role, created_at`,
      [newRole, userId],
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    logger.info(`User role converted: ${userId} -> ${newRole}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error converting user role: ${error.message}`);
    throw error;
  }
};
