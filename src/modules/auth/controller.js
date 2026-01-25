import { sendSuccess, sendError } from '../../utils/response.js';
import { validate, authSchemas } from '../../utils/validators.js';
import logger from '../../utils/logger.js';
import * as authService from './service.js';

/**
 * Send OTP endpoint
 */
export const sendOTP = async (req, res, next) => {
  try {
    const { error, value } = validate(req.body, authSchemas.sendOTP);

    if (error) {
      return sendError(res, 400, 'Validation error', {
        errors: error.details.map((d) => d.message),
      });
    }

    const result = await authService.sendOTP(value.phone);
    return sendSuccess(res, 200, result, 'OTP sent successfully');
  } catch (error) {
    logger.error('Send OTP error:', error);
    next(error);
  }
};

/**
 * Verify OTP endpoint
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { error, value } = validate(req.body, authSchemas.verifyOTP);

    if (error) {
      return sendError(res, 400, 'Validation error', {
        errors: error.details.map((d) => d.message),
      });
    }

    const result = await authService.verifyOTP(value.phone, value.otp, value.otp_id);

    // Exclude password from response
    const userData = { ...result.user };
    delete userData.password_hash;

    return sendSuccess(res, 200, { token: result.token, user: userData }, 'Login successful');
  } catch (error) {
    logger.error('Verify OTP error:', error);
    return sendError(res, 400, error.message);
  }
};

/**
 * Register endpoint
 */
export const register = async (req, res, next) => {
  try {
    const { error, value } = validate(req.body, authSchemas.register);

    if (error) {
      return sendError(res, 400, 'Validation error', {
        errors: error.details.map((d) => d.message),
      });
    }

    const result = await authService.registerUser(
      value.email,
      value.password,
      value.full_name,
      value.phone
    );

    // Exclude password from response
    const userData = { ...result.user };
    delete userData.password_hash;

    return sendSuccess(res, 201, { token: result.token, user: userData }, 'Registration successful');
  } catch (error) {
    logger.error('Register error:', error);
    if (error.message.includes('already')) {
      return sendError(res, 409, error.message);
    }
    next(error);
  }
};

/**
 * Login endpoint
 */
export const login = async (req, res, next) => {
  try {
    const { error, value } = validate(req.body, authSchemas.login);

    if (error) {
      return sendError(res, 400, 'Validation error', {
        errors: error.details.map((d) => d.message),
      });
    }

    const result = await authService.loginUser(value.email, value.password);

    // Exclude password from response
    const userData = { ...result.user };
    delete userData.password_hash;

    return sendSuccess(res, 200, { token: result.token, user: userData }, 'Login successful');
  } catch (error) {
    logger.error('Login error:', error);
    return sendError(res, 401, error.message);
  }
};

/**
 * Verify email endpoint
 */
export const verifyEmailToken = async (req, res, next) => {
  try {
    const { error, value } = validate(req.body, authSchemas.verifyEmail);

    if (error) {
      return sendError(res, 400, 'Validation error', {
        errors: error.details.map((d) => d.message),
      });
    }

    const result = await authService.verifyEmail(value.token);
    return sendSuccess(res, 200, result, 'Email verified successfully');
  } catch (error) {
    logger.error('Verify email error:', error);
    return sendError(res, 400, error.message);
  }
};

/**
 * Get current user endpoint
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Not authenticated');
    }

    const user = await authService.getUserById(req.user.user_id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Exclude password from response
    const userData = { ...user };
    delete userData.password_hash;

    return sendSuccess(res, 200, userData, 'User fetched successfully');
  } catch (error) {
    logger.error('Get current user error:', error);
    next(error);
  }
};

export default {
  sendOTP,
  verifyOTP,
  register,
  login,
  verifyEmailToken,
  getCurrentUser,
};
