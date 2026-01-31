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
import kycRoutes from './modules/kyc/routes.js';
import partsRoutes from './modules/parts/routes.js';
import mechanicRoutes from './modules/mechanic/routes.js';
import rentalRoutes from './modules/rental/routes.js';
import rsaRoutes from './modules/rsa/routes.js';
import cleaningRoutes from './modules/cleaning/routes.js';
import paymentRoutes from './modules/payment/routes.js';
import locationRoutes from './modules/location/routes.js';
import notificationRoutes from './modules/notification/routes.js';
import adminRoutes from './modules/admin/routes.js';

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
      users: '/api/users',
      kyc: '/api/kyc',
      parts: '/api/parts',
      mechanic: '/api/mechanic',
      rental: '/api/rental',
      rsa: '/api/rsa',
      cleaning: '/api/cleaning',
      payment: '/api/payment',
      location: '/api/location',
      notification: '/api/notification',
      admin: '/api/admin',
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

// Core routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Feature routes
app.use('/api/kyc', kycRoutes);
app.use('/api/parts', partsRoutes);
app.use('/api/mechanic', mechanicRoutes);
app.use('/api/rental', rentalRoutes);
app.use('/api/rsa', rsaRoutes);
app.use('/api/cleaning', cleaningRoutes);

// Service routes
app.use('/api/payment', paymentRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/notification', notificationRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

/**
 * Error handling
 */

// 404 handler (must be last route handler)
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
