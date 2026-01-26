import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './connection.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run database migrations
 */
async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    logger.info('Starting database migrations...');

    for (const file of files) {
      if (!file.endsWith('.sql')) continue;

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      logger.info(`Running migration: ${file}`);

      // Split by semicolon and filter empty statements
      const statements = sql.split(';').filter((stmt) => stmt.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          await query(statement);
        }
      }

      logger.info(`✓ Completed migration: ${file}`);
    }

    logger.info('✓ All migrations completed successfully');
  } catch (error) {
    logger.error('Migration error:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export default runMigrations;
