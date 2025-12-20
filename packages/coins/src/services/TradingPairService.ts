import { prisma, TradingPair, TradingPairStatus } from '@fry-exchange/database';
import { TradingPairConfig, DEFAULT_MAKER_FEE, DEFAULT_TAKER_FEE } from '@fry-exchange/common';

export class TradingPairService {
  /**
   * Create a new trading pair
   */
  async createPair(
    baseCoinSymbol: string,
    quoteCoinSymbol: string,
    config?: Partial<TradingPairConfig>
  ): Promise<TradingPair> {
    // Get coins
    const [baseCoin, quoteCoin] = await Promise.all([
      prisma.coin.findUnique({ where: { symbol: baseCoinSymbol.toUpperCase() } }),
      prisma.coin.findUnique({ where: { symbol: quoteCoinSymbol.toUpperCase() } }),
    ]);

    if (!baseCoin || !quoteCoin) {
      throw new Error('One or both coins not found');
    }

    const symbol = `${baseCoin.symbol}_${quoteCoin.symbol}`;

    // Check if pair already exists
    const existing = await prisma.tradingPair.findUnique({
      where: { symbol },
    });

    if (existing) {
      throw new Error(`Trading pair ${symbol} already exists`);
    }

    return prisma.tradingPair.create({
      data: {
        symbol,
        baseCoinId: baseCoin.id,
        quoteCoinId: quoteCoin.id,
        status: TradingPairStatus.ACTIVE,
        minQuantity: parseFloat(config?.minQuantity || '0.00001'),
        maxQuantity: parseFloat(config?.maxQuantity || '999999999'),
        minPrice: 0.00000001,
        maxPrice: 999999999,
        tickSize: parseFloat(config?.tickSize || '0.00000001'),
        stepSize: parseFloat(config?.stepSize || '0.00000001'),
        makerFee: parseFloat(config?.makerFee || DEFAULT_MAKER_FEE),
        takerFee: parseFloat(config?.takerFee || DEFAULT_TAKER_FEE),
      },
    });
  }

  /**
   * Get trading pair by symbol
   */
  async getBySymbol(symbol: string): Promise<TradingPair | null> {
    return prisma.tradingPair.findUnique({
      where: { symbol: symbol.toUpperCase() },
      include: {
        baseCoin: true,
        quoteCoin: true,
      },
    });
  }

  /**
   * List all trading pairs
   */
  async listPairs(options: {
    status?: TradingPairStatus;
    baseCoinId?: string;
    quoteCoinId?: string;
  } = {}): Promise<TradingPair[]> {
    return prisma.tradingPair.findMany({
      where: {
        ...(options.status && { status: options.status }),
        ...(options.baseCoinId && { baseCoinId: options.baseCoinId }),
        ...(options.quoteCoinId && { quoteCoinId: options.quoteCoinId }),
      },
      include: {
        baseCoin: true,
        quoteCoin: true,
      },
      orderBy: { symbol: 'asc' },
    });
  }

  /**
   * Update trading pair status
   */
  async updateStatus(symbol: string, status: TradingPairStatus): Promise<TradingPair> {
    return prisma.tradingPair.update({
      where: { symbol: symbol.toUpperCase() },
      data: { status },
    });
  }

  /**
   * Update trading pair fees
   */
  async updateFees(
    symbol: string,
    makerFee: string,
    takerFee: string
  ): Promise<TradingPair> {
    return prisma.tradingPair.update({
      where: { symbol: symbol.toUpperCase() },
      data: {
        makerFee: parseFloat(makerFee),
        takerFee: parseFloat(takerFee),
      },
    });
  }

  /**
   * Update trading limits
   */
  async updateLimits(
    symbol: string,
    limits: {
      minQuantity?: string;
      maxQuantity?: string;
      minPrice?: string;
      maxPrice?: string;
      tickSize?: string;
      stepSize?: string;
    }
  ): Promise<TradingPair> {
    return prisma.tradingPair.update({
      where: { symbol: symbol.toUpperCase() },
      data: {
        ...(limits.minQuantity && { minQuantity: parseFloat(limits.minQuantity) }),
        ...(limits.maxQuantity && { maxQuantity: parseFloat(limits.maxQuantity) }),
        ...(limits.minPrice && { minPrice: parseFloat(limits.minPrice) }),
        ...(limits.maxPrice && { maxPrice: parseFloat(limits.maxPrice) }),
        ...(limits.tickSize && { tickSize: parseFloat(limits.tickSize) }),
        ...(limits.stepSize && { stepSize: parseFloat(limits.stepSize) }),
      },
    });
  }

  /**
   * Halt trading on a pair
   */
  async haltTrading(symbol: string): Promise<TradingPair> {
    return this.updateStatus(symbol, TradingPairStatus.HALTED);
  }

  /**
   * Resume trading on a pair
   */
  async resumeTrading(symbol: string): Promise<TradingPair> {
    return this.updateStatus(symbol, TradingPairStatus.ACTIVE);
  }

  /**
   * Delist a trading pair
   */
  async delist(symbol: string): Promise<TradingPair> {
    return this.updateStatus(symbol, TradingPairStatus.DELISTED);
  }
}

export const tradingPairService = new TradingPairService();
