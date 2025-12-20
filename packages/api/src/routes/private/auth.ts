import { Router, Request, Response } from 'express';
import { authService, apiKeyService } from '@fry-exchange/user';
import {
  registerUserSchema,
  loginUserSchema,
  createApiKeySchema,
  API_CODES,
} from '@fry-exchange/common';

export const authRoutes = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
authRoutes.post('/register', async (req: Request, res: Response) => {
  try {
    const input = registerUserSchema.parse(req.body);
    const result = await authService.register(input);

    if (!result.success) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: result.error,
      });
      return;
    }

    res.status(201).json({
      code: API_CODES.SUCCESS,
      data: {
        user: {
          id: result.user!.id,
          email: result.user!.email,
          username: result.user!.username,
        },
        tokens: result.tokens,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'Invalid input',
        errors: (error as any).errors,
      });
      return;
    }
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Registration failed',
    });
  }
});

/**
 * POST /api/v1/auth/login
 * Login user
 */
authRoutes.post('/login', async (req: Request, res: Response) => {
  try {
    const input = loginUserSchema.parse(req.body);
    const result = await authService.login(input);

    if (result.requiresTwoFactor) {
      res.status(200).json({
        code: API_CODES.SUCCESS,
        data: { requiresTwoFactor: true },
      });
      return;
    }

    if (!result.success) {
      res.status(401).json({
        code: API_CODES.INVALID_CREDENTIALS,
        message: result.error,
      });
      return;
    }

    res.json({
      code: API_CODES.SUCCESS,
      data: {
        user: {
          id: result.user!.id,
          email: result.user!.email,
          username: result.user!.username,
        },
        tokens: result.tokens,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Login failed',
    });
  }
});

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
authRoutes.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'Refresh token required',
      });
      return;
    }

    const result = await authService.refreshToken(refreshToken);

    if (!result.success) {
      res.status(401).json({
        code: API_CODES.INVALID_CREDENTIALS,
        message: result.error,
      });
      return;
    }

    res.json({
      code: API_CODES.SUCCESS,
      data: { tokens: result.tokens },
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Token refresh failed',
    });
  }
});

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
authRoutes.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    res.json({ code: API_CODES.SUCCESS });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Logout failed',
    });
  }
});

/**
 * POST /api/v1/auth/2fa/setup
 * Setup 2FA
 */
authRoutes.post('/2fa/setup', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { secret, otpAuthUrl } = await authService.setup2FA(userId);

    res.json({
      code: API_CODES.SUCCESS,
      data: { secret, otpAuthUrl },
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: '2FA setup failed',
    });
  }
});

/**
 * POST /api/v1/auth/2fa/enable
 * Enable 2FA
 */
authRoutes.post('/2fa/enable', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { code } = req.body;

    const success = await authService.enable2FA(userId, code);

    if (!success) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'Invalid 2FA code',
      });
      return;
    }

    res.json({ code: API_CODES.SUCCESS });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: '2FA enable failed',
    });
  }
});

/**
 * GET /api/v1/auth/apikeys
 * List API keys
 */
authRoutes.get('/apikeys', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const keys = await apiKeyService.listByUser(userId);

    res.json({
      code: API_CODES.SUCCESS,
      data: keys.map((key) => ({
        id: key.id,
        name: key.name,
        permissions: key.permissions,
        ipWhitelist: key.ipWhitelist,
        lastUsedAt: key.lastUsedAt,
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to list API keys',
    });
  }
});

/**
 * POST /api/v1/auth/apikeys
 * Create API key
 */
authRoutes.post('/apikeys', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const input = createApiKeySchema.parse(req.body);

    const result = await apiKeyService.create({
      userId,
      ...input,
    });

    res.status(201).json({
      code: API_CODES.SUCCESS,
      data: {
        id: result.apiKey.id,
        name: result.apiKey.name,
        key: result.key,
        secret: result.secret,
        permissions: result.apiKey.permissions,
        warning: 'Store these credentials securely. They will not be shown again.',
      },
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to create API key',
    });
  }
});

/**
 * DELETE /api/v1/auth/apikeys/:id
 * Delete API key
 */
authRoutes.delete('/apikeys/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const success = await apiKeyService.delete(id, userId);

    if (!success) {
      res.status(404).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'API key not found',
      });
      return;
    }

    res.json({ code: API_CODES.SUCCESS });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to delete API key',
    });
  }
});
