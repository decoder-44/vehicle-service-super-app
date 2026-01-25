import { validate } from '../utils/validators.js';

/**
 * Validation middleware factory
 */
export const validateRequest = async (schema) => {
  return (req, res, next) => {
    const { error, value } = validate(req.body, schema);

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      const err = new Error('Validation failed');
      err.details = error.details;
      return next(err);
    }

    req.body = value;
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = validate(req.query, schema);

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      const err = new Error('Query validation failed');
      err.details = error.details;
      return next(err);
    }

    req.query = value;
    next();
  };
};

export default {
  validateRequest,
  validateQuery,
};
