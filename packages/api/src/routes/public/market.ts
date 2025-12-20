import { Router, Request, Response } from 'express';
import { prisma } from '@fry-exchange/database';
import { coinService, tradingPairService } from '@fry-exchange/coins';
import { API_CODES } from '@fry-exchange/common';

export const publicMarketRoutes = Router();

/**
 * GET /api/v1/market/coins
 * List all available coins
 */
publicMarketRoutes.get('/coins', async (_req: Request, res: Response) => {
  try {
    const coins = await coinService.listCoins({ tradingEnabled: true });
    res.json({
      code: API_CODES.SUCCESS,
      data: coins.map((coin) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        decimals: coin.decimals,
        depositEnabled: coin.depositEnabled,
        withdrawalEnabled: coin.withdrawalEnabled,
      })),
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch coins',
    });
  }
});

/**
 * GET /api/v1/market/pairs
 * List all trading pairs
 */
publicMarketRoutes.get('/pairs', async (_req: Request, res: Response) => {
  try {
    const pairs = await tradingPairService.listPairs();
    res.json({
      code: API_CODES.SUCCESS,
      data: pairs.map((pair) => ({
        symbol: pair.symbol,
        baseCoin: (pair as any).baseCoin?.symbol,
        quoteCoin: (pair as any).quoteCoin?.symbol,
        status: pair.status,
        minQuantity: pair.minQuantity.toString(),
        maxQuantity: pair.maxQuantity.toString(),
        tickSize: pair.tickSize.toString(),
        stepSize: pair.stepSize.toString(),
        makerFee: pair.makerFee.toString(),
        takerFee: pair.takerFee.toString(),
      })),
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch trading pairs',
    });
  }
});

/**
 * GET /api/v1/market/ticker/:symbol
 * Get ticker for a symbol
 */
publicMarketRoutes.get('/ticker/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const ticker = await prisma.ticker.findUnique({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!ticker) {
      res.status(404).json({
        code: API_CODES.SYMBOL_NOT_FOUND,
        message: 'Symbol not found',
      });
      return;
    }

    res.json({
      code: API_CODES.SUCCESS,
      data: {
        symbol: ticker.symbol,
        lastPrice: ticker.lastPrice.toString(),
        priceChange: ticker.priceChange.toString(),
        priceChangePercent: ticker.priceChangePercent.toString(),
        highPrice: ticker.highPrice.toString(),
        lowPrice: ticker.lowPrice.toString(),
        volume: ticker.volume.toString(),
        quoteVolume: ticker.quoteVolume.toString(),
        bidPrice: ticker.bidPrice.toString(),
        askPrice: ticker.askPrice.toString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch ticker',
    });
  }
});

/**
 * GET /api/v1/market/tickers
 * Get all tickers
 */
publicMarketRoutes.get('/tickers', async (_req: Request, res: Response) => {
  try {
    const tickers = await prisma.ticker.findMany();
    res.json({
      code: API_CODES.SUCCESS,
      data: tickers.map((ticker) => ({
        symbol: ticker.symbol,
        lastPrice: ticker.lastPrice.toString(),
        priceChange: ticker.priceChange.toString(),
        priceChangePercent: ticker.priceChangePercent.toString(),
        highPrice: ticker.highPrice.toString(),
        lowPrice: ticker.lowPrice.toString(),
        volume: ticker.volume.toString(),
        quoteVolume: ticker.quoteVolume.toString(),
      })),
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch tickers',
    });
  }
});

/**
 * GET /api/v1/market/orderbook/:symbol
 * Get order book for a symbol
 */
publicMarketRoutes.get('/orderbook/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;

    // In production, this would fetch from the matching engine
    // For now, return empty order book
    res.json({
      code: API_CODES.SUCCESS,
      data: {
        symbol: symbol.toUpperCase(),
        bids: [],
        asks: [],
        lastUpdateId: 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch order book',
    });
  }
});

/**
 * GET /api/v1/market/trades/:symbol
 * Get recent trades for a symbol
 */
publicMarketRoutes.get('/trades/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);

    const trades = await prisma.trade.findMany({
      where: { symbol: symbol.toUpperCase() },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    res.json({
      code: API_CODES.SUCCESS,
      data: trades.map((trade) => ({
        id: trade.id,
        price: trade.price.toString(),
        quantity: trade.quantity.toString(),
        quoteQuantity: trade.quoteQuantity.toString(),
        isBuyerMaker: trade.isBuyerMaker,
        timestamp: trade.timestamp.toISOString(),
      })),
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch trades',
    });
  }
});

/**
 * GET /api/v1/market/klines/:symbol
 * Get kline/candlestick data
 */
publicMarketRoutes.get('/klines/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const interval = (req.query.interval as string) || '1h';
    const limit = Math.min(parseInt(req.query.limit as string) || 500, 1000);

    const klines = await prisma.kline.findMany({
      where: {
        symbol: symbol.toUpperCase(),
        interval,
      },
      orderBy: { openTime: 'desc' },
      take: limit,
    });

    res.json({
      code: API_CODES.SUCCESS,
      data: klines.reverse().map((kline) => ({
        openTime: kline.openTime.getTime(),
        open: kline.open.toString(),
        high: kline.high.toString(),
        low: kline.low.toString(),
        close: kline.close.toString(),
        volume: kline.volume.toString(),
        closeTime: kline.closeTime.getTime(),
        quoteVolume: kline.quoteVolume.toString(),
        trades: kline.trades,
      })),
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch klines',
    });
  }
});
