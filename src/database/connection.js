import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'vehicle_super_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
});

// Error handling
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Connection event
pool.on('connect', () => {
  logger.info('Database pool connected');
});

/**
 * Execute a query with parameters
 * @param {string} query - SQL query string
 * @param {array} params - Query parameters
 * @returns {Promise} Query result
 */
export const query = async (queryText, params = []) => {
  const start = Date.now();
  try {
    const result = await pool.query(queryText, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn(`Query took ${duration}ms: ${queryText.substring(0, 50)}`);
    }
    return result;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
};

/**
 * Get a client for transactions
 * @returns {Promise} PostgreSQL client
 */
export const getClient = async () => {
  return pool.connect();
};

/**
 * Close the pool
 */
export const closePool = async () => {
  await pool.end();
  logger.info('Database pool closed');
};

export default pool;
