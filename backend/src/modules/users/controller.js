import * as userService from './service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { validateRequest } from '../../middleware/validator.js';
import { validators } from '../../utils/validators.js';
import logger from '../../utils/logger.js';
import { STATUS_CODES } from './constants.js';

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
    const response = {
      statusCode: STATUS_CODES.SUCCESS,
      message: 'User profile retrieved',
      data: user
    }
    sendSuccess(res, response);
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
    const response = {
      statusCode: STATUS_CODES.SUCCESS,
      message: 'User profile updated',
      data: updated
    }
    sendSuccess(res, response);
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
    const response = {
      statusCode: STATUS_CODES.SUCCESS,
      message: 'Password changed successfully',
      data: null
    }
    sendSuccess(res, response);
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
    const response = {
      statusCode: STATUS_CODES.SUCCESS,
      message: 'Account deactivated successfully',
      data: null
    }
    sendSuccess(res, response);
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
    const response = {
      statusCode: STATUS_CODES.SUCCESS,
      message: 'Address added successfully',
      data: address
    }
    sendSuccess(res, response);
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
    const addresses = await userService.getUserAddresses(req.user.user_id);
    const response = {
      statusCode: STATUS_CODES.SUCCESS,
      message: 'Addresses retrieved',
      data: addresses
    }
    sendSuccess(res, response);
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

    const updated = await userService.updateAddress(req.user.user_id, req.params.id, req.body);
    const response = {
      statusCode: STATUS_CODES.SUCCESS,
      message: 'Address updated successfully',
      data: updated
    }
    sendSuccess(res, response);
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
    const response = {
      statusCode: STATUS_CODES.SUCCESS,
      message: 'Address deleted successfully',
      data: null
    }
    sendSuccess(res, response);
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
    const response = {
      statusCode: STATUS_CODES.SUCCESS,
      message: 'Role converted successfully',
      data: updated
    }
    sendSuccess(res, response);
  } catch (error) {
    logger.error(`Error in convertRole: ${error.message}`);
    next(error);
  }
};
