import { errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * Authorization Middleware
 * Checks if user has required role(s)
 */

/**
 * Check if user has required role
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 */
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return errorResponse(res, 'Unauthorized - Please login', 401);
            }

            const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

            if (!roles.includes(req.user.role)) {
                logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`);
                return errorResponse(
                    res,
                    `Forbidden - Requires ${roles.join(' or ')} role`,
                    403
                );
            }

            next();
        } catch (error) {
            logger.error(`Role authorization error: ${error.message}`);
            return errorResponse(res, 'Authorization error', 500);
        }
    };
};

/**
 * Check if user is admin
 */
export const requireAdmin = requireRole('admin');

/**
 * Check if user is merchant
 */
export const requireMerchant = requireRole('merchant');

/**
 * Check if user is mechanic
 */
export const requireMechanic = requireRole('mechanic');

/**
 * Check if user is host (rental vehicle owner)
 */
export const requireHost = requireRole('host');

/**
 * Check if user has verified KYC
 */
export const requireVerifiedKYC = (req, res, next) => {
    try {
        if (!req.user) {
            return errorResponse(res, 'Unauthorized - Please login', 401);
        }

        if (req.user.kyc_status !== 'approved') {
            return errorResponse(
                res,
                'KYC verification required. Please complete KYC verification to access this feature.',
                403
            );
        }

        next();
    } catch (error) {
        logger.error(`KYC verification check error: ${error.message}`);
        return errorResponse(res, 'Authorization error', 500);
    }
};

/**
 * Check if user is provider (mechanic, merchant, or host)
 */
export const requireProvider = requireRole(['mechanic', 'merchant', 'host']);

/**
 * Combined middleware: require role AND verified KYC
 */
export const requireRoleAndKYC = (allowedRoles) => {
    return [requireRole(allowedRoles), requireVerifiedKYC];
};
