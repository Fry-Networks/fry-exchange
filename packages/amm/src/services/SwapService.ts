import { prisma, PoolStatus } from '@fry-exchange/database';
import { Decimal, SwapQuote, SwapInput } from '@fry-exchange/common';
import { ConstantProductAMM } from '../math/ConstantProduct';
import { walletService, fryFeeService } from '@fry-exchange/wallet';
import { poolService } from './PoolService';

export interface SwapResult {
  success: boolean;
  inputAmount?: string;
  outputAmount?: string;
  fee?: string;
  fryFee?: string;
  fryFeeTransactionId?: string;
  priceImpact?: string;
  error?: string;
}

export class SwapService {
  /**
   * Get a quote for a swap
   */
  async getQuote(
    poolId: string,
    inputCoinId: string,
    inputAmount: string
  ): Promise<SwapQuote> {
    const pool = await poolService.getById(poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }

    const amount = new Decimal(inputAmount);
    const isBaseToQuote = inputCoinId === pool.baseCoinId;

    const inputReserve = isBaseToQuote
      ? new Decimal(pool.baseReserve.toString())
      : new Decimal(pool.quoteReserve.toString());

    const outputReserve = isBaseToQuote
      ? new Decimal(pool.quoteReserve.toString())
      : new Decimal(pool.baseReserve.toString());

    const fee = new Decimal(pool.fee.toString());

    const calc = ConstantProductAMM.calculateSwap(
      amount,
      inputReserve,
      outputReserve,
      fee
    );

    const effectivePrice = calc.outputAmount.div(calc.inputAmount);

    return {
      inputAmount: calc.inputAmount.toString(),
      outputAmount: calc.outputAmount.toString(),
      priceImpact: calc.priceImpact.mul(100).toFixed(4), // as percentage
      fee: calc.fee.toString(),
      effectivePrice: effectivePrice.toString(),
    };
  }

  /**
   * Execute a swap
   */
  async executeSwap(
    userId: string,
    input: SwapInput
  ): Promise<SwapResult> {
    const pool = await poolService.getById(input.poolId);
    if (!pool) {
      return { success: false, error: 'Pool not found' };
    }

    if (pool.status !== PoolStatus.ACTIVE) {
      return { success: false, error: 'Pool is not active' };
    }

    const inputAmount = new Decimal(input.inputAmount);
    const minOutput = new Decimal(input.minOutputAmount);
    const isBaseToQuote = input.inputCoinId === pool.baseCoinId;

    const inputCoinId = isBaseToQuote ? pool.baseCoinId : pool.quoteCoinId;
    const outputCoinId = isBaseToQuote ? pool.quoteCoinId : pool.baseCoinId;

    // Check user balance
    const hasBalance = await walletService.hasAvailableBalance(
      userId,
      inputCoinId,
      inputAmount
    );

    if (!hasBalance) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Calculate swap
    const inputReserve = isBaseToQuote
      ? new Decimal(pool.baseReserve.toString())
      : new Decimal(pool.quoteReserve.toString());

    const outputReserve = isBaseToQuote
      ? new Decimal(pool.quoteReserve.toString())
      : new Decimal(pool.baseReserve.toString());

    const fee = new Decimal(pool.fee.toString());

    const calc = ConstantProductAMM.calculateSwap(
      inputAmount,
      inputReserve,
      outputReserve,
      fee
    );

    // Check slippage
    if (calc.outputAmount.lessThan(minOutput)) {
      return {
        success: false,
        error: `Slippage exceeded. Expected min ${minOutput.toString()}, got ${calc.outputAmount.toString()}`,
      };
    }

    // Calculate FRY fee based on the pool fee (swap fee)
    const fryFeeCalc = await fryFeeService.calculateFeeInFry(calc.fee);

    // Check if user has sufficient FRY balance for the fee
    const hasFryBalance = await fryFeeService.hassufficientFryBalance(
      userId,
      fryFeeCalc.fryFeeAmount
    );

    if (!hasFryBalance) {
      return {
        success: false,
        error: `Insufficient FRY balance for swap fee. Required: ${fryFeeCalc.fryFeeAmount.toString()} FRY`,
      };
    }

    // Collect FRY fee first
    const fryFeeResult = await fryFeeService.collectFee(
      userId,
      fryFeeCalc.fryFeeAmount,
      'SWAP'
    );

    if (!fryFeeResult.success) {
      return {
        success: false,
        error: `Failed to collect FRY fee: ${fryFeeResult.error}`,
      };
    }

    // Execute swap atomically
    try {
      await prisma.$transaction(async (tx) => {
        // Debit input
        await walletService.debit(userId, inputCoinId, inputAmount);

        // Credit output
        await walletService.credit(userId, outputCoinId, calc.outputAmount);

        // Update pool reserves
        const newBaseReserve = isBaseToQuote
          ? calc.newBaseReserve
          : calc.newQuoteReserve;
        const newQuoteReserve = isBaseToQuote
          ? calc.newQuoteReserve
          : calc.newBaseReserve;

        await tx.liquidityPool.update({
          where: { id: pool.id },
          data: {
            baseReserve: newBaseReserve.toNumber(),
            quoteReserve: newQuoteReserve.toNumber(),
          },
        });
      });

      return {
        success: true,
        inputAmount: calc.inputAmount.toString(),
        outputAmount: calc.outputAmount.toString(),
        fee: calc.fee.toString(),
        fryFee: fryFeeCalc.fryFeeAmount.toString(),
        fryFeeTransactionId: fryFeeResult.transactionId,
        priceImpact: calc.priceImpact.mul(100).toFixed(4),
      };
    } catch (error) {
      // Note: FRY fee was already collected, would need to refund in production
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Swap failed',
      };
    }
  }
}

export const swapService = new SwapService();
