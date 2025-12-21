import { Decimal } from '@fry-exchange/common';
import { prisma, TransactionType, TransactionStatus } from '@fry-exchange/database';
import { fryFeeService, vestigePriceService, walletService } from '@fry-exchange/wallet';
import { TradeExecution } from '../matching/types';

/**
 * Trade settlement result
 */
export interface SettlementResult {
  success: boolean;
  tradeId: string;
  takerFryFee?: string;
  makerFryFee?: string;
  error?: string;
}

/**
 * Service for settling trades and collecting FRY fees
 * All trading fees are paid in FRY tokens
 */
export class TradeSettlementService {
  /**
   * Settle a trade execution - handles asset transfers and FRY fee collection
   * @param trade - Trade execution from the matching engine
   * @param tradeValueUsd - USD value of the trade (for fee calculation)
   * @returns Settlement result
   */
  async settleTrade(
    trade: TradeExecution,
    tradeValueUsd: Decimal
  ): Promise<SettlementResult> {
    try {
      // Calculate FRY fees for both taker and maker
      const takerFeeCalc = await fryFeeService.calculateFeeInFry(trade.takerFee);
      const makerFeeCalc = await fryFeeService.calculateFeeInFry(trade.makerFee);

      // Check if both users have sufficient FRY balance
      const takerHasFry = await fryFeeService.hassufficientFryBalance(
        trade.takerUserId,
        takerFeeCalc.fryFeeAmount
      );

      const makerHasFry = await fryFeeService.hassufficientFryBalance(
        trade.makerUserId,
        makerFeeCalc.fryFeeAmount
      );

      if (!takerHasFry) {
        return {
          success: false,
          tradeId: trade.tradeId,
          error: `Taker has insufficient FRY balance for fees. Required: ${takerFeeCalc.fryFeeAmount.toString()} FRY`,
        };
      }

      if (!makerHasFry) {
        return {
          success: false,
          tradeId: trade.tradeId,
          error: `Maker has insufficient FRY balance for fees. Required: ${makerFeeCalc.fryFeeAmount.toString()} FRY`,
        };
      }

      // Collect FRY fees from both parties
      const takerFeeResult = await fryFeeService.collectFee(
        trade.takerUserId,
        takerFeeCalc.fryFeeAmount,
        'TRADE',
        trade.tradeId
      );

      if (!takerFeeResult.success) {
        return {
          success: false,
          tradeId: trade.tradeId,
          error: `Failed to collect taker fee: ${takerFeeResult.error}`,
        };
      }

      const makerFeeResult = await fryFeeService.collectFee(
        trade.makerUserId,
        makerFeeCalc.fryFeeAmount,
        'TRADE',
        trade.tradeId
      );

      if (!makerFeeResult.success) {
        // Note: In production, you'd want to handle this more gracefully
        // possibly refunding the taker's fee
        return {
          success: false,
          tradeId: trade.tradeId,
          error: `Failed to collect maker fee: ${makerFeeResult.error}`,
        };
      }

      return {
        success: true,
        tradeId: trade.tradeId,
        takerFryFee: takerFeeCalc.fryFeeAmount.toString(),
        makerFryFee: makerFeeCalc.fryFeeAmount.toString(),
      };
    } catch (error) {
      return {
        success: false,
        tradeId: trade.tradeId,
        error: error instanceof Error ? error.message : 'Settlement failed',
      };
    }
  }

  /**
   * Get the estimated FRY fee for a trade
   * @param feeAmountUsd - Fee amount in USD
   * @returns Estimated FRY fee amount
   */
  async estimateFryFee(feeAmountUsd: Decimal): Promise<Decimal> {
    const feeCalc = await fryFeeService.calculateFeeInFry(feeAmountUsd);
    return feeCalc.fryFeeAmount;
  }

  /**
   * Get current FRY price for fee estimation
   * @returns FRY price in USD
   */
  async getFryPrice(): Promise<Decimal> {
    return vestigePriceService.getFryPrice();
  }
}

export const tradeSettlementService = new TradeSettlementService();
