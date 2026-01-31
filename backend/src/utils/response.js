/**
 * Standardized API Response format
 */
export class ApiResponse {
  constructor(errorCode, statusCode, data, message = 'Success', success = true) {
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success;
  }
}

/**
 * Send successful response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {*} data - Response data
 * @param {string} message - Response message
 */
export const sendSuccess = (res, responseData ) => {
  const {statusCode = 200, message = 'Success', data = null} = responseData;
  return res.status(statusCode).json(new ApiResponse(null, statusCode, data, message, true));
};

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} data - Additional error data
 * @param {string} errorCode - Application-specific error code
 */
export const sendError = (res, errorData) => {
  const {code, statusCode = 500, message = 'Internal Server Error', data = null} = errorData;
  return res.status(statusCode).json(new ApiResponse(code, statusCode, data, message, false));
};

/**
 * Generate a unique order/booking number
 * @param {string} prefix - Prefix for the number (e.g., 'ORD', 'BKG')
 * @returns {string} Generated number
 */
export const generateUniqueNumber = (prefix) => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Paginate array or query results
 * @param {array} items - Items to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {object} Paginated response
 */
export const paginate = (items, page = 1, limit = 10, total = items.length) => {
  const pages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);

  return {
    items: paginatedItems,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    },
  };
};

export default {
  ApiResponse,
  sendSuccess,
  sendError,
  generateUniqueNumber,
  paginate,
};
