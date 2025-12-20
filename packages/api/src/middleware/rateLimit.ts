import rateLimit from 'express-rate-limit';
import {
  RATE_LIMIT_PUBLIC,
  RATE_LIMIT_AUTHENTICATED,
  RATE_LIMIT_ORDERS,
  RATE_LIMIT_WITHDRAWALS,
  API_CODES,
} from '@fry-exchange/common';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);

/**
 * Rate limiter for public endpoints
 */
export const publicRateLimiter = rateLimit({
  windowMs,
  max: RATE_LIMIT_PUBLIC,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      code: API_CODES.RATE_LIMITED,
      message: 'Too many requests, please try again later',
    });
  },
});

/**
 * Rate limiter for authenticated endpoints
 */
export const authenticatedRateLimiter = rateLimit({
  windowMs,
  max: RATE_LIMIT_AUTHENTICATED,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip || 'unknown',
  handler: (_req, res) => {
    res.status(429).json({
      code: API_CODES.RATE_LIMITED,
      message: 'Too many requests, please try again later',
    });
  },
});

/**
 * Stricter rate limiter for order submission
 */
export const orderRateLimiter = rateLimit({
  windowMs,
  max: RATE_LIMIT_ORDERS,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip || 'unknown',
  handler: (_req, res) => {
    res.status(429).json({
      code: API_CODES.RATE_LIMITED,
      message: 'Order rate limit exceeded',
    });
  },
});

/**
 * Very strict rate limiter for withdrawals
 */
export const withdrawalRateLimiter = rateLimit({
  windowMs: 60000 * 5, // 5 minutes
  max: RATE_LIMIT_WITHDRAWALS,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip || 'unknown',
  handler: (_req, res) => {
    res.status(429).json({
      code: API_CODES.RATE_LIMITED,
      message: 'Withdrawal rate limit exceeded',
    });
  },
});
