import { prisma, PoolStatus, LiquidityPosition } from '@fry-exchange/database';
import { Decimal, AddLiquidityInput, RemoveLiquidityInput } from '@fry-exchange/common';
import { ConstantProductAMM } from '../math/ConstantProduct';
import { walletService } from '@fry-exchange/wallet';
import { poolService } from './PoolService';

export interface LiquidityResult {
  success: boolean;
  lpTokens?: string;
  baseAmount?: string;
  quoteAmount?: string;
  error?: string;
}

export class LiquidityService {
  /**
   * Add liquidity to a pool
   */
  async addLiquidity(
    userId: string,
    input: AddLiquidityInput
  ): Promise<LiquidityResult> {
    const pool = await poolService.getById(input.poolId);
    if (!pool) {
      return { success: false, error: 'Pool not found' };
    }

    if (pool.status !== PoolStatus.ACTIVE) {
      return { success: false, error: 'Pool is not active' };
    }

    const baseAmount = new Decimal(input.baseAmount);
    const quoteAmount = new Decimal(input.quoteAmount);
    const baseReserve = new Decimal(pool.baseReserve.toString());
    const quoteReserve = new Decimal(pool.quoteReserve.toString());
    const totalSupply = new Decimal(pool.lpTokenSupply.toString());

    // Check balances
    const [hasBase, hasQuote] = await Promise.all([
      walletService.hasAvailableBalance(userId, pool.baseCoinId, baseAmount),
      walletService.hasAvailableBalance(userId, pool.quoteCoinId, quoteAmount),
    ]);

    if (!hasBase || !hasQuote) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Calculate LP tokens and optimal amounts
    const { lpTokens, optimalBaseAmount, optimalQuoteAmount } =
      ConstantProductAMM.calculateLiquidityMint(
        baseAmount,
        quoteAmount,
        baseReserve,
        quoteReserve,
        totalSupply
      );

    if (lpTokens.isZero()) {
      return { success: false, error: 'Insufficient liquidity amount' };
    }

    // Execute liquidity addition
    try {
      await prisma.$transaction(async (tx) => {
        // Debit tokens from user
        await walletService.debit(userId, pool.baseCoinId, optimalBaseAmount);
        await walletService.debit(userId, pool.quoteCoinId, optimalQuoteAmount);

        // Update pool reserves
        await tx.liquidityPool.update({
          where: { id: pool.id },
          data: {
            baseReserve: baseReserve.plus(optimalBaseAmount).toNumber(),
            quoteReserve: quoteReserve.plus(optimalQuoteAmount).toNumber(),
            lpTokenSupply: totalSupply.plus(lpTokens).toNumber(),
          },
        });

        // Update or create liquidity position
        await tx.liquidityPosition.upsert({
          where: {
            userId_poolId: { userId, poolId: pool.id },
          },
          update: {
            lpTokenBalance: {
              increment: lpTokens.toNumber(),
            },
          },
          create: {
            userId,
            poolId: pool.id,
            lpTokenBalance: lpTokens.toNumber(),
          },
        });
      });

      return {
        success: true,
        lpTokens: lpTokens.toString(),
        baseAmount: optimalBaseAmount.toString(),
        quoteAmount: optimalQuoteAmount.toString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Add liquidity failed',
      };
    }
  }

  /**
   * Remove liquidity from a pool
   */
  async removeLiquidity(
    userId: string,
    input: RemoveLiquidityInput
  ): Promise<LiquidityResult> {
    const pool = await poolService.getById(input.poolId);
    if (!pool) {
      return { success: false, error: 'Pool not found' };
    }

    const lpTokenAmount = new Decimal(input.lpTokenAmount);
    const slippage = new Decimal(input.slippageTolerance);

    // Get user's position
    const position = await prisma.liquidityPosition.findUnique({
      where: {
        userId_poolId: { userId, poolId: pool.id },
      },
    });

    if (!position || new Decimal(position.lpTokenBalance.toString()).lessThan(lpTokenAmount)) {
      return { success: false, error: 'Insufficient LP tokens' };
    }

    const baseReserve = new Decimal(pool.baseReserve.toString());
    const quoteReserve = new Decimal(pool.quoteReserve.toString());
    const totalSupply = new Decimal(pool.lpTokenSupply.toString());

    // Calculate tokens to receive
    const { baseAmount, quoteAmount } = ConstantProductAMM.calculateLiquidityRemoval(
      lpTokenAmount,
      baseReserve,
      quoteReserve,
      totalSupply
    );

    // Apply slippage
    const minBase = baseAmount.mul(new Decimal(1).minus(slippage));
    const minQuote = quoteAmount.mul(new Decimal(1).minus(slippage));

    // Execute liquidity removal
    try {
      await prisma.$transaction(async (tx) => {
        // Update pool reserves
        await tx.liquidityPool.update({
          where: { id: pool.id },
          data: {
            baseReserve: baseReserve.minus(baseAmount).toNumber(),
            quoteReserve: quoteReserve.minus(quoteAmount).toNumber(),
            lpTokenSupply: totalSupply.minus(lpTokenAmount).toNumber(),
          },
        });

        // Update position
        const newBalance = new Decimal(position.lpTokenBalance.toString()).minus(lpTokenAmount);
        if (newBalance.isZero()) {
          await tx.liquidityPosition.delete({
            where: { id: position.id },
          });
        } else {
          await tx.liquidityPosition.update({
            where: { id: position.id },
            data: {
              lpTokenBalance: newBalance.toNumber(),
            },
          });
        }

        // Credit tokens to user
        await walletService.credit(userId, pool.baseCoinId, baseAmount);
        await walletService.credit(userId, pool.quoteCoinId, quoteAmount);
      });

      return {
        success: true,
        lpTokens: lpTokenAmount.toString(),
        baseAmount: baseAmount.toString(),
        quoteAmount: quoteAmount.toString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Remove liquidity failed',
      };
    }
  }

  /**
   * Get user's liquidity positions
   */
  async getUserPositions(userId: string): Promise<LiquidityPosition[]> {
    return prisma.liquidityPosition.findMany({
      where: { userId },
      include: {
        pool: {
          include: {
            baseCoin: true,
            quoteCoin: true,
          },
        },
      },
    });
  }

  /**
   * Get position share percentage
   */
  async getPositionShare(userId: string, poolId: string): Promise<string> {
    const [position, pool] = await Promise.all([
      prisma.liquidityPosition.findUnique({
        where: { userId_poolId: { userId, poolId } },
      }),
      poolService.getById(poolId),
    ]);

    if (!position || !pool || new Decimal(pool.lpTokenSupply.toString()).isZero()) {
      return '0';
    }

    const share = new Decimal(position.lpTokenBalance.toString())
      .div(pool.lpTokenSupply.toString())
      .mul(100);

    return share.toFixed(4);
  }
}

export const liquidityService = new LiquidityService();
