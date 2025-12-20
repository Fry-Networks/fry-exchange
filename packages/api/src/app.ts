import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { publicRoutes, privateRoutes, adminRoutes } from './routes';
import { authMiddleware, adminMiddleware } from './middleware/auth';
import { publicRateLimiter, authenticatedRateLimiter } from './middleware/rateLimit';
import { API_CODES } from '@fry-exchange/common';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  }));

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Public API routes (with public rate limiting)
  app.use('/api/v1', publicRateLimiter, publicRoutes);

  // Private API routes (authenticated + rate limiting)
  app.use('/api/v1', authMiddleware, authenticatedRateLimiter, privateRoutes);

  // Admin routes
  app.use('/api/v1/admin', authMiddleware, adminMiddleware, adminRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      code: API_CODES.INVALID_REQUEST,
      message: 'Endpoint not found',
    });
  });

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Internal server error',
    });
  });

  return app;
}
