import { Router, Request, Response } from 'express';
import { walletService, depositService, withdrawalService } from '@fry-exchange/wallet';
import { withdrawalSchema, API_CODES } from '@fry-exchange/common';
import { withdrawalRateLimiter } from '../../middleware/rateLimit';
import { requirePermission } from '../../middleware/auth';

export const walletRoutes = Router();

/**
 * GET /api/v1/wallet/balances
 * Get all balances
 */
walletRoutes.get('/balances', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const balances = await walletService.getUserBalances(userId);

    res.json({
      code: API_CODES.SUCCESS,
      data: balances,
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch balances',
    });
  }
});

/**
 * GET /api/v1/wallet/deposit-address
 * Get deposit address
 */
walletRoutes.get('/deposit-address', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { coinId, network } = req.query;

    if (!coinId || !network) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'coinId and network are required',
      });
      return;
    }

    const depositInfo = await depositService.getDepositAddress(
      userId,
      coinId as string,
      network as string
    );

    res.json({
      code: API_CODES.SUCCESS,
      data: depositInfo,
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to get deposit address',
    });
  }
});

/**
 * GET /api/v1/wallet/deposits
 * Get deposit history
 */
walletRoutes.get('/deposits', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const coinId = req.query.coinId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const deposits = await depositService.getDepositHistory(userId, {
      coinId,
      limit,
      offset,
    });

    res.json({
      code: API_CODES.SUCCESS,
      data: deposits.map((d) => ({
        id: d.id,
        coin: (d as any).coin?.symbol,
        amount: d.amount.toString(),
        status: d.status,
        txHash: d.txHash,
        network: d.network,
        confirmations: d.confirmations,
        requiredConfirmations: d.requiredConfirmations,
        createdAt: d.createdAt.toISOString(),
        completedAt: d.completedAt?.toISOString(),
      })),
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch deposits',
    });
  }
});

/**
 * POST /api/v1/wallet/withdraw
 * Request withdrawal
 */
walletRoutes.post(
  '/withdraw',
  requirePermission('WITHDRAW' as any),
  withdrawalRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const input = withdrawalSchema.parse(req.body);

      const result = await withdrawalService.requestWithdrawal({
        userId,
        ...input,
      });

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
          transactionId: result.transactionId,
          message: 'Withdrawal request submitted',
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          code: API_CODES.INVALID_REQUEST,
          message: 'Invalid withdrawal parameters',
          errors: (error as any).errors,
        });
        return;
      }
      res.status(500).json({
        code: API_CODES.INTERNAL_ERROR,
        message: 'Failed to process withdrawal',
      });
    }
  }
);

/**
 * DELETE /api/v1/wallet/withdraw/:id
 * Cancel pending withdrawal
 */
walletRoutes.delete('/withdraw/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const success = await withdrawalService.cancelWithdrawal(id, userId);

    if (!success) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'Cannot cancel withdrawal',
      });
      return;
    }

    res.json({
      code: API_CODES.SUCCESS,
      message: 'Withdrawal cancelled',
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to cancel withdrawal',
    });
  }
});

/**
 * GET /api/v1/wallet/withdrawals
 * Get withdrawal history
 */
walletRoutes.get('/withdrawals', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const coinId = req.query.coinId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const withdrawals = await withdrawalService.getWithdrawalHistory(userId, {
      coinId,
      limit,
      offset,
    });

    res.json({
      code: API_CODES.SUCCESS,
      data: withdrawals.map((w) => ({
        id: w.id,
        coin: (w as any).coin?.symbol,
        amount: w.amount.toString(),
        fee: w.fee.toString(),
        status: w.status,
        txHash: w.txHash,
        network: w.network,
        toAddress: w.toAddress,
        createdAt: w.createdAt.toISOString(),
        completedAt: w.completedAt?.toISOString(),
      })),
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch withdrawals',
    });
  }
});
