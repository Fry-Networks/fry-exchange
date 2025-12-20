import { Router, Request, Response } from 'express';
import { coinService, tradingPairService } from '@fry-exchange/coins';
import { poolService } from '@fry-exchange/amm';
import { API_CODES, CoinConfig, NetworkType } from '@fry-exchange/common';

export const adminCoinRoutes = Router();

/**
 * POST /api/v1/admin/coins
 * Add a new coin
 */
adminCoinRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const config: CoinConfig = req.body;

    if (!config.symbol || !config.name || !config.networks?.length) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'symbol, name, and networks are required',
      });
      return;
    }

    const coin = await coinService.addCoin(config);

    res.status(201).json({
      code: API_CODES.SUCCESS,
      data: {
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to add coin',
    });
  }
});

/**
 * POST /api/v1/admin/coins/:coinId/networks
 * Add a network to a coin
 */
adminCoinRoutes.post('/:coinId/networks', async (req: Request, res: Response) => {
  try {
    const { coinId } = req.params;
    const networkConfig = req.body;

    const network = await coinService.addNetwork(coinId, networkConfig);

    res.status(201).json({
      code: API_CODES.SUCCESS,
      data: {
        id: network.id,
        network: network.network,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to add network',
    });
  }
});

/**
 * PATCH /api/v1/admin/coins/:coinId
 * Update coin settings
 */
adminCoinRoutes.patch('/:coinId', async (req: Request, res: Response) => {
  try {
    const { coinId } = req.params;
    const { depositEnabled, withdrawalEnabled, tradingEnabled, status } = req.body;

    if (depositEnabled !== undefined) {
      await coinService.setDepositEnabled(coinId, depositEnabled);
    }
    if (withdrawalEnabled !== undefined) {
      await coinService.setWithdrawalEnabled(coinId, withdrawalEnabled);
    }
    if (tradingEnabled !== undefined) {
      await coinService.setTradingEnabled(coinId, tradingEnabled);
    }
    if (status) {
      await coinService.updateStatus(coinId, status);
    }

    const coin = await coinService.getById(coinId);

    res.json({
      code: API_CODES.SUCCESS,
      data: coin,
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to update coin',
    });
  }
});

/**
 * POST /api/v1/admin/coins/pairs
 * Create a trading pair
 */
adminCoinRoutes.post('/pairs', async (req: Request, res: Response) => {
  try {
    const { baseCoin, quoteCoin, ...config } = req.body;

    if (!baseCoin || !quoteCoin) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'baseCoin and quoteCoin are required',
      });
      return;
    }

    const pair = await tradingPairService.createPair(baseCoin, quoteCoin, config);

    res.status(201).json({
      code: API_CODES.SUCCESS,
      data: {
        symbol: pair.symbol,
        status: pair.status,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to create trading pair',
    });
  }
});

/**
 * PATCH /api/v1/admin/coins/pairs/:symbol
 * Update trading pair
 */
adminCoinRoutes.patch('/pairs/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { status, makerFee, takerFee, ...limits } = req.body;

    if (status) {
      await tradingPairService.updateStatus(symbol, status);
    }
    if (makerFee && takerFee) {
      await tradingPairService.updateFees(symbol, makerFee, takerFee);
    }
    if (Object.keys(limits).length > 0) {
      await tradingPairService.updateLimits(symbol, limits);
    }

    const pair = await tradingPairService.getBySymbol(symbol);

    res.json({
      code: API_CODES.SUCCESS,
      data: pair,
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to update trading pair',
    });
  }
});

/**
 * POST /api/v1/admin/coins/pools
 * Create a liquidity pool
 */
adminCoinRoutes.post('/pools', async (req: Request, res: Response) => {
  try {
    const { baseCoinId, quoteCoinId, fee } = req.body;

    if (!baseCoinId || !quoteCoinId) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: 'baseCoinId and quoteCoinId are required',
      });
      return;
    }

    const pool = await poolService.create({ baseCoinId, quoteCoinId, fee });

    res.status(201).json({
      code: API_CODES.SUCCESS,
      data: {
        id: pool.id,
        symbol: pool.symbol,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      res.status(400).json({
        code: API_CODES.INVALID_REQUEST,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to create pool',
    });
  }
});

/**
 * POST /api/v1/admin/coins/pairs/:symbol/halt
 * Halt trading on a pair
 */
adminCoinRoutes.post('/pairs/:symbol/halt', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    await tradingPairService.haltTrading(symbol);

    res.json({
      code: API_CODES.SUCCESS,
      message: `Trading halted for ${symbol}`,
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to halt trading',
    });
  }
});

/**
 * POST /api/v1/admin/coins/pairs/:symbol/resume
 * Resume trading on a pair
 */
adminCoinRoutes.post('/pairs/:symbol/resume', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    await tradingPairService.resumeTrading(symbol);

    res.json({
      code: API_CODES.SUCCESS,
      message: `Trading resumed for ${symbol}`,
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to resume trading',
    });
  }
});
