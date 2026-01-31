import { sendError } from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Custom API errors
  if (err.statusCode || err.code) {
    return sendError(res, err.code, err.statusCode, err.message,  err.data);
  }

  // Default error
  return sendError(res, 500, 'Internal server error');
};

/**
 * 404 handler
 */
export const notFoundHandler = (req, res) => {
  sendError(res, 404, `Route ${req.originalUrl} not found`);
};

export default {
  errorHandler,
  notFoundHandler,
};
