import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '@fry-exchange/user';
import { apiKeyService } from '@fry-exchange/user';
import { API_CODES, ApiKeyPermission, UserRole } from '@fry-exchange/common';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      apiKey?: { userId: string; permissions: string[] };
    }
  }
}

/**
 * Authentication middleware
 * Supports both JWT and API key authentication
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Try JWT first
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
      next();
      return;
    } catch {
      // Invalid JWT, try API key
    }
  }

  // Try API key
  const apiKey = req.headers['x-api-key'];
  if (typeof apiKey === 'string') {
    apiKeyService.validate(apiKey).then((key) => {
      if (key) {
        // Check IP whitelist
        const clientIp = req.ip || req.socket.remoteAddress || '';
        if (!apiKeyService.isIpAllowed(key, clientIp)) {
          res.status(403).json({
            code: API_CODES.INSUFFICIENT_PERMISSIONS,
            message: 'IP not whitelisted',
          });
          return;
        }

        req.apiKey = {
          userId: key.userId,
          permissions: key.permissions,
        };
        req.user = { userId: key.userId, email: '', role: 'USER' };
        next();
        return;
      }

      res.status(401).json({
        code: API_CODES.INVALID_CREDENTIALS,
        message: 'Invalid API key',
      });
    }).catch(() => {
      res.status(401).json({
        code: API_CODES.INVALID_CREDENTIALS,
        message: 'Invalid API key',
      });
    });
    return;
  }

  res.status(401).json({
    code: API_CODES.AUTHENTICATION_REQUIRED,
    message: 'Authentication required',
  });
}

/**
 * Check if request has required API key permission
 */
export function requirePermission(permission: ApiKeyPermission) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // JWT auth has all permissions
    if (req.user && !req.apiKey) {
      next();
      return;
    }

    // API key needs specific permission
    if (req.apiKey && req.apiKey.permissions.includes(permission)) {
      next();
      return;
    }

    res.status(403).json({
      code: API_CODES.INSUFFICIENT_PERMISSIONS,
      message: `Permission ${permission} required`,
    });
  };
}

/**
 * Admin-only middleware
 */
export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN) {
    next();
    return;
  }

  res.status(403).json({
    code: API_CODES.INSUFFICIENT_PERMISSIONS,
    message: 'Admin access required',
  });
}

/**
 * Optional auth - doesn't fail if no auth provided
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Ignore invalid token
    }
  }
  next();
}
