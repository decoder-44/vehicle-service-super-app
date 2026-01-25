import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * Authentication middleware - validates JWT token
 */
export const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return sendError(res, 401, 'No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    return sendError(res, 401, 'Invalid or expired token');
  }
};

/**
 * Authorization middleware - checks user role
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * KYC verification middleware
 */
export const requireKYC = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 401, 'User not authenticated');
  }

  if (req.user.kyc_status !== 'approved') {
    return sendError(
      res,
      403,
      'KYC verification required for this action',
      { kyc_status: req.user.kyc_status }
    );
  }

  next();
};

export default {
  requireAuth,
  requireRole,
  requireKYC,
};
