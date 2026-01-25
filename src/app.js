import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

// Route imports
import authRoutes from './modules/auth/routes.js';
import userRoutes from './modules/users/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

/**
 * Middleware
 */

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
app.use(generalLimiter);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

/**
 * Root endpoint with API info
 */
app.get('/', (req, res) => {
  res.status(200).json({
    statusCode: 200,
    success: true,
    message: 'Vehicle Super App - Multi-sided Marketplace Platform',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users (Phase 1.5)',
      kyc: '/api/kyc (Phase 2)',
      parts: '/api/parts (Phase 3)',
      mechanic: '/api/mechanic (Phase 4)',
      rental: '/api/rental (Phase 5)',
      rsa: '/api/rsa (Phase 6)',
      payment: '/api/payment (Phase 9)',
      admin: '/api/admin (Phase 8)',
    },
    documentation: '/README.md',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * API Routes
 */

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// TODO: Add other module routes
// app.use('/api/users', userRoutes);
// app.use('/api/kyc', kycRoutes);
// app.use('/api/parts', partsRoutes);
// app.use('/api/mechanic', mechanicRoutes);
// app.use('/api/rental', rentalRoutes);
// app.use('/api/rsa', rsaRoutes);
// app.use('/api/cleaning', cleaningRoutes);
// app.use('/api/payment', paymentRoutes);
// app.use('/api/admin', adminRoutes);

/**
 * Error handling
 */

// 404 handler (must be last route handler)
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
