import { Router, Request, Response } from 'express';
import { poolService, swapService, liquidityService } from '@fry-exchange/amm';
import { API_CODES } from '@fry-exchange/common';

export const ammRoutes = Router();

/**
 * GET /api/v1/amm/pools
 * List all liquidity pools
 */
ammRoutes.get('/pools', async (_req: Request, res: Response) => {
  try {
    const pools = await poolService.listPools();

    res.json({
      code: API_CODES.SUCCESS,
      data: pools.map((pool) => ({
        id: pool.id,
        symbol: pool.symbol,
        baseCoin: (pool as any).baseCoin?.symbol,
        quoteCoin: (pool as any).quoteCoin?.symbol,
        baseReserve: pool.baseReserve.toString(),
        quoteReserve: pool.quoteReserve.toString(),
        lpTokenSupply: pool.lpTokenSupply.toString(),
        fee: pool.fee.toString(),
        status: pool.status,
      })),
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch pools',
    });
  }
});

/**
 * GET /api/v1/amm/pools/:poolId
 * Get pool details
 */
ammRoutes.get('/pools/:poolId', async (req: Request, res: Response) => {
  try {
    const { poolId } = req.params;
    const pool = await poolService.getById(poolId);

    if (!pool) {
      res.status(404).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'Pool not found',
      });
      return;
    }

    const stats = await poolService.getPoolStats(poolId);

    res.json({
      code: API_CODES.SUCCESS,
      data: {
        id: pool.id,
        symbol: pool.symbol,
        baseCoin: (pool as any).baseCoin?.symbol,
        quoteCoin: (pool as any).quoteCoin?.symbol,
        baseReserve: pool.baseReserve.toString(),
        quoteReserve: pool.quoteReserve.toString(),
        lpTokenSupply: pool.lpTokenSupply.toString(),
        fee: pool.fee.toString(),
        status: pool.status,
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch pool',
    });
  }
});

/**
 * GET /api/v1/amm/quote
 * Get swap quote
 */
ammRoutes.get('/quote', async (req: Request, res: Response) => {
  try {
    const { poolId, inputCoinId, inputAmount } = req.query;

    if (!poolId || !inputCoinId || !inputAmount) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'poolId, inputCoinId, and inputAmount are required',
      });
      return;
    }

    const quote = await swapService.getQuote(
      poolId as string,
      inputCoinId as string,
      inputAmount as string
    );

    res.json({
      code: API_CODES.SUCCESS,
      data: quote,
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to get quote',
    });
  }
});

/**
 * POST /api/v1/amm/swap
 * Execute swap
 */
ammRoutes.post('/swap', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { poolId, inputCoinId, inputAmount, minOutputAmount } = req.body;

    if (!poolId || !inputCoinId || !inputAmount || !minOutputAmount) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'Missing required fields',
      });
      return;
    }

    const result = await swapService.executeSwap(userId, {
      poolId,
      inputCoinId,
      inputAmount,
      minOutputAmount,
    });

    if (!result.success) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: result.error,
      });
      return;
    }

    res.json({
      code: API_CODES.SUCCESS,
      data: {
        inputAmount: result.inputAmount,
        outputAmount: result.outputAmount,
        fee: result.fee,
        priceImpact: result.priceImpact,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Swap failed',
    });
  }
});

/**
 * POST /api/v1/amm/liquidity/add
 * Add liquidity
 */
ammRoutes.post('/liquidity/add', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { poolId, baseAmount, quoteAmount, slippageTolerance } = req.body;

    if (!poolId || !baseAmount || !quoteAmount) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'Missing required fields',
      });
      return;
    }

    const result = await liquidityService.addLiquidity(userId, {
      poolId,
      baseAmount,
      quoteAmount,
      slippageTolerance: slippageTolerance || '0.01',
    });

    if (!result.success) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: result.error,
      });
      return;
    }

    res.json({
      code: API_CODES.SUCCESS,
      data: {
        lpTokens: result.lpTokens,
        baseAmount: result.baseAmount,
        quoteAmount: result.quoteAmount,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Add liquidity failed',
    });
  }
});

/**
 * POST /api/v1/amm/liquidity/remove
 * Remove liquidity
 */
ammRoutes.post('/liquidity/remove', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { poolId, lpTokenAmount, slippageTolerance } = req.body;

    if (!poolId || !lpTokenAmount) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'Missing required fields',
      });
      return;
    }

    const result = await liquidityService.removeLiquidity(userId, {
      poolId,
      lpTokenAmount,
      slippageTolerance: slippageTolerance || '0.01',
    });

    if (!result.success) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: result.error,
      });
      return;
    }

    res.json({
      code: API_CODES.SUCCESS,
      data: {
        lpTokens: result.lpTokens,
        baseAmount: result.baseAmount,
        quoteAmount: result.quoteAmount,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Remove liquidity failed',
    });
  }
});

/**
 * GET /api/v1/amm/positions
 * Get user's liquidity positions
 */
ammRoutes.get('/positions', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const positions = await liquidityService.getUserPositions(userId);

    res.json({
      code: API_CODES.SUCCESS,
      data: positions.map((pos) => ({
        id: pos.id,
        poolId: pos.poolId,
        poolSymbol: (pos as any).pool?.symbol,
        lpTokenBalance: pos.lpTokenBalance.toString(),
        createdAt: pos.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch positions',
    });
  }
});
