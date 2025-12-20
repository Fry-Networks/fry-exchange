import { prisma, LiquidityPool, PoolStatus } from '@fry-exchange/database';
import { Decimal, DEFAULT_POOL_FEE } from '@fry-exchange/common';

export interface CreatePoolInput {
  baseCoinId: string;
  quoteCoinId: string;
  fee?: string;
}

export class PoolService {
  /**
   * Create a new liquidity pool
   */
  async create(input: CreatePoolInput): Promise<LiquidityPool> {
    // Get coin symbols
    const [baseCoin, quoteCoin] = await Promise.all([
      prisma.coin.findUnique({ where: { id: input.baseCoinId } }),
      prisma.coin.findUnique({ where: { id: input.quoteCoinId } }),
    ]);

    if (!baseCoin || !quoteCoin) {
      throw new Error('Invalid coin IDs');
    }

    const symbol = `${baseCoin.symbol}_${quoteCoin.symbol}`;

    // Check if pool already exists
    const existing = await prisma.liquidityPool.findUnique({
      where: { symbol },
    });

    if (existing) {
      throw new Error('Pool already exists');
    }

    return prisma.liquidityPool.create({
      data: {
        symbol,
        baseCoinId: input.baseCoinId,
        quoteCoinId: input.quoteCoinId,
        baseReserve: 0,
        quoteReserve: 0,
        lpTokenSupply: 0,
        fee: parseFloat(input.fee || DEFAULT_POOL_FEE),
        status: PoolStatus.ACTIVE,
      },
    });
  }

  /**
   * Get pool by symbol
   */
  async getBySymbol(symbol: string): Promise<LiquidityPool | null> {
    return prisma.liquidityPool.findUnique({
      where: { symbol },
      include: {
        baseCoin: true,
        quoteCoin: true,
      },
    });
  }

  /**
   * Get pool by ID
   */
  async getById(poolId: string): Promise<LiquidityPool | null> {
    return prisma.liquidityPool.findUnique({
      where: { id: poolId },
      include: {
        baseCoin: true,
        quoteCoin: true,
      },
    });
  }

  /**
   * List all pools
   */
  async listPools(options: {
    status?: PoolStatus;
    limit?: number;
    offset?: number;
  } = {}): Promise<LiquidityPool[]> {
    return prisma.liquidityPool.findMany({
      where: options.status ? { status: options.status } : {},
      include: {
        baseCoin: true,
        quoteCoin: true,
      },
      take: options.limit || 100,
      skip: options.offset || 0,
    });
  }

  /**
   * Update pool reserves (internal use)
   */
  async updateReserves(
    poolId: string,
    baseReserve: Decimal,
    quoteReserve: Decimal,
    lpTokenSupply: Decimal
  ): Promise<LiquidityPool> {
    return prisma.liquidityPool.update({
      where: { id: poolId },
      data: {
        baseReserve: baseReserve.toNumber(),
        quoteReserve: quoteReserve.toNumber(),
        lpTokenSupply: lpTokenSupply.toNumber(),
      },
    });
  }

  /**
   * Pause a pool
   */
  async pausePool(poolId: string): Promise<LiquidityPool> {
    return prisma.liquidityPool.update({
      where: { id: poolId },
      data: { status: PoolStatus.PAUSED },
    });
  }

  /**
   * Resume a pool
   */
  async resumePool(poolId: string): Promise<LiquidityPool> {
    return prisma.liquidityPool.update({
      where: { id: poolId },
      data: { status: PoolStatus.ACTIVE },
    });
  }

  /**
   * Get pool statistics
   */
  async getPoolStats(poolId: string): Promise<{
    tvlUsd: string;
    volume24h: string;
    fees24h: string;
    apr: string;
  }> {
    const pool = await this.getById(poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }

    // In production, calculate from actual trade data and price feeds
    return {
      tvlUsd: '0',
      volume24h: '0',
      fees24h: '0',
      apr: '0',
    };
  }
}

export const poolService = new PoolService();
