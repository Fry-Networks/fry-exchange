import { Router, Request, Response } from 'express';
import { userService, authService } from '@fry-exchange/user';
import { changePasswordSchema, API_CODES } from '@fry-exchange/common';
import { prisma } from '@fry-exchange/database';

export const accountRoutes = Router();

/**
 * GET /api/v1/account/profile
 * Get user profile
 */
accountRoutes.get('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await userService.getById(userId);

    if (!user) {
      res.status(404).json({
        code: API_CODES.USER_NOT_FOUND,
        message: 'User not found',
      });
      return;
    }

    res.json({
      code: API_CODES.SUCCESS,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
        role: user.role,
        kycStatus: user.kycStatus,
        twoFactorEnabled: user.twoFactorEnabled,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch profile',
    });
  }
});

/**
 * PATCH /api/v1/account/profile
 * Update user profile
 */
accountRoutes.patch('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { username } = req.body;

    if (!username) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'No updates provided',
      });
      return;
    }

    const user = await userService.updateProfile(userId, { username });

    res.json({
      code: API_CODES.SUCCESS,
      data: {
        id: user!.id,
        username: user!.username,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Username already taken') {
      res.status(400).json({
        code: API_CODES.USERNAME_ALREADY_EXISTS,
        message: 'Username already taken',
      });
      return;
    }
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to update profile',
    });
  }
});

/**
 * POST /api/v1/account/change-password
 * Change password
 */
accountRoutes.post('/change-password', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const input = changePasswordSchema.parse(req.body);

    const success = await authService.changePassword(
      userId,
      input.currentPassword,
      input.newPassword
    );

    if (!success) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'Invalid current password',
      });
      return;
    }

    res.json({
      code: API_CODES.SUCCESS,
      message: 'Password changed successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'Invalid password format',
        errors: (error as any).errors,
      });
      return;
    }
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to change password',
    });
  }
});

/**
 * GET /api/v1/account/trades
 * Get user's trade history
 */
accountRoutes.get('/trades', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const symbol = req.query.symbol as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const offset = parseInt(req.query.offset as string) || 0;

    const trades = await prisma.trade.findMany({
      where: {
        OR: [{ buyerUserId: userId }, { sellerUserId: userId }],
        ...(symbol && { symbol: symbol.toUpperCase() }),
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });

    res.json({
      code: API_CODES.SUCCESS,
      data: trades.map((trade) => {
        const isBuyer = trade.buyerUserId === userId;
        return {
          id: trade.id,
          symbol: trade.symbol,
          side: isBuyer ? 'BUY' : 'SELL',
          price: trade.price.toString(),
          quantity: trade.quantity.toString(),
          quoteQuantity: trade.quoteQuantity.toString(),
          fee: isBuyer ? trade.buyerFee.toString() : trade.sellerFee.toString(),
          feeCoin: isBuyer ? trade.buyerFeeCoin : trade.sellerFeeCoin,
          isMaker: isBuyer ? trade.isBuyerMaker : !trade.isBuyerMaker,
          timestamp: trade.timestamp.toISOString(),
        };
      }),
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch trades',
    });
  }
});

/**
 * GET /api/v1/account/activity
 * Get account activity log
 */
accountRoutes.get('/activity', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    // Get recent transactions as activity
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { coin: true },
    });

    res.json({
      code: API_CODES.SUCCESS,
      data: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        status: tx.status,
        coin: tx.coin.symbol,
        amount: tx.amount.toString(),
        fee: tx.fee.toString(),
        createdAt: tx.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch activity',
    });
  }
});
