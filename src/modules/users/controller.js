import * as userService from './service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { validateRequest } from '../../middleware/validator.js';
import { validators } from '../../utils/validators.js';
import logger from '../../utils/logger.js';

/**
 * User Controller - Phase 1.5
 * Handles all user-related HTTP requests
 */

/**
 * GET /api/users/me - Get current user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user.user_id);
    sendSuccess(res, 200, 'User profile retrieved', user);
  } catch (error) {
    logger.error(`Error in getProfile: ${error.message}`);
    next(error);
  }
};

/**
 * PUT /api/users/me - Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    await validateRequest(req.body, validators.updateProfile);
    
    const updated = await userService.updateUserProfile(req.user.user_id, req.body);
    sendSuccess(res, 200, 'Profile updated successfully', updated);
  } catch (error) {
    logger.error(`Error in updateProfile: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/users/change-password - Change user password
 */
export const changePassword = async (req, res, next) => {
  try {
    await validateRequest(req.body, validators.changePassword);

    const { oldPassword, newPassword } = req.body;
    await userService.changePassword(req.user.user_id, oldPassword, newPassword);

    sendSuccess(res, 200, 'Password changed successfully', null);
  } catch (error) {
    logger.error(`Error in changePassword: ${error.message}`);
    next(error);
  }
};

/**
 * DELETE /api/users/me - Deactivate user account
 */
export const deactivateAccount = async (req, res, next) => {
  try {
    await userService.deactivateAccount(req.user.user_id);
    sendSuccess(res, 200, 'Account deactivated successfully', null);
  } catch (error) {
    logger.error(`Error in deactivateAccount: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/users/addresses - Add new address
 */
export const addAddress = async (req, res, next) => {
  try {
    await validateRequest(req.body, validators.addAddress);

    const address = await userService.addAddress(req.user.user_id, req.body);
    sendSuccess(res, 201, 'Address added successfully', address);
  } catch (error) {
    logger.error(`Error in addAddress: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/users/addresses - Get all user addresses
 */
export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await userService.getUserAddresses(req.user.id);
    sendSuccess(res, 200, 'Addresses retrieved', addresses);
  } catch (error) {
    logger.error(`Error in getAddresses: ${error.message}`);
    next(error);
  }
};

/**
 * PUT /api/users/addresses/:id - Update address
 */
export const updateAddress = async (req, res, next) => {
  try {
    await validateRequest(req.body, validators.updateAddress);

    const updated = await userService.updateAddress(req.user.id, req.params.id, req.body);
    sendSuccess(res, 200, 'Address updated successfully', updated);
  } catch (error) {
    logger.error(`Error in updateAddress: ${error.message}`);
    next(error);
  }
};

/**
 * DELETE /api/users/addresses/:id - Delete address
 */
export const deleteAddress = async (req, res, next) => {
  try {
    await userService.deleteAddress(req.user.id, req.params.id);
    sendSuccess(res, 200, 'Address deleted successfully', null);
  } catch (error) {
    logger.error(`Error in deleteAddress: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/users/convert-role - Convert user role
 */
export const convertRole = async (req, res, next) => {
  try {
    await validateRequest(req.body, validators.convertRole);

    const updated = await userService.convertUserRole(req.user.user_id, req.body.newRole);
    sendSuccess(res, 200, 'Role converted successfully', updated);
  } catch (error) {
    logger.error(`Error in convertRole: ${error.message}`);
    next(error);
  }
};
