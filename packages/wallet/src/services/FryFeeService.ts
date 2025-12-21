import {
  prisma,
  TransactionStatus,
  TransactionType,
} from '@fry-exchange/database';
import {
  Decimal,
  FRY_TOKEN,
  generateTransactionId,
  DEFAULT_CONFIRMATIONS,
} from '@fry-exchange/common';
import { vestigePriceService } from './VestigePriceService';
import { walletService } from './WalletService';
import { AlgorandAdapter } from '../chains/AlgorandAdapter';

/**
 * Fee calculation result
 */
export interface FeeCalculation {
  // Original fee in the quote currency (e.g., USDT)
  originalFeeAmount: Decimal;
  originalFeeCurrency: string;
  // Equivalent fee in FRY tokens
  fryFeeAmount: Decimal;
  // FRY price at time of calculation
  fryPriceUsd: Decimal;
}

/**
 * Fee collection result
 */
export interface FeeCollectionResult {
  success: boolean;
  transactionId?: string;
  fryAmount?: string;
  error?: string;
}

/**
 * Types of fees that can be collected
 */
export type FeeType = 'TRADE' | 'WITHDRAWAL' | 'SWAP';

/**
 * Service for handling FRY token fee payments
 * All fees on the exchange are paid in FRY tokens
 */
export class FryFeeService {
  private algorandAdapter: AlgorandAdapter;
  private fryCoinId: string | null = null;

  constructor() {
    this.algorandAdapter = new AlgorandAdapter();
  }

  /**
   * Initialize the service and ensure FRY coin exists in the database
   */
  async initialize(): Promise<void> {
    // Find or cache the FRY coin ID
    const fryCoin = await prisma.coin.findFirst({
      where: {
        OR: [
          { symbol: FRY_TOKEN.SYMBOL },
          {
            networks: {
              some: {
                contractAddress: FRY_TOKEN.ASA_ID.toString(),
                network: 'ALGORAND',
              },
            },
          },
        ],
      },
    });

    if (fryCoin) {
      this.fryCoinId = fryCoin.id;
    }
  }

  /**
   * Get the FRY coin ID, initializing if necessary
   */
  async getFryCoinId(): Promise<string> {
    if (!this.fryCoinId) {
      await this.initialize();
    }

    if (!this.fryCoinId) {
      throw new Error(
        'FRY token not configured in the system. Please add FRY coin with ASA ID ' +
          FRY_TOKEN.ASA_ID
      );
    }

    return this.fryCoinId;
  }

  /**
   * Calculate the fee amount in FRY tokens
   * @param feeAmountUsd - Fee amount in USD
   * @returns Fee calculation with FRY amount
   */
  async calculateFeeInFry(feeAmountUsd: Decimal): Promise<FeeCalculation> {
    const fryPrice = await vestigePriceService.getFryPrice();
    const fryAmount = await vestigePriceService.usdToFry(feeAmountUsd);

    return {
      originalFeeAmount: feeAmountUsd,
      originalFeeCurrency: 'USD',
      fryFeeAmount: fryAmount,
      fryPriceUsd: fryPrice,
    };
  }

  /**
   * Calculate trading fee in FRY
   * @param tradeValueUsd - Total trade value in USD
   * @param feeRate - Fee rate as decimal (e.g., 0.001 for 0.1%)
   * @returns Fee calculation with FRY amount
   */
  async calculateTradingFeeInFry(
    tradeValueUsd: Decimal,
    feeRate: Decimal
  ): Promise<FeeCalculation> {
    const feeAmountUsd = tradeValueUsd.mul(feeRate);
    return this.calculateFeeInFry(feeAmountUsd);
  }

  /**
   * Check if user has sufficient FRY balance to pay the fee
   * @param userId - User ID
   * @param fryAmount - Required FRY amount
   * @returns True if user has sufficient balance
   */
  async hassufficientFryBalance(
    userId: string,
    fryAmount: Decimal
  ): Promise<boolean> {
    const fryCoinId = await this.getFryCoinId();
    return walletService.hasAvailableBalance(userId, fryCoinId, fryAmount);
  }

  /**
   * Collect fee from user in FRY tokens
   * This debits the user's FRY balance and records the fee transaction
   * @param userId - User ID
   * @param fryAmount - Amount of FRY to collect
   * @param feeType - Type of fee (trade, withdrawal, swap)
   * @param referenceId - Optional reference to the related transaction
   * @returns Collection result
   */
  async collectFee(
    userId: string,
    fryAmount: Decimal,
    feeType: FeeType,
    referenceId?: string
  ): Promise<FeeCollectionResult> {
    try {
      const fryCoinId = await this.getFryCoinId();

      // Check balance
      const hasBalance = await walletService.hasAvailableBalance(
        userId,
        fryCoinId,
        fryAmount
      );

      if (!hasBalance) {
        return {
          success: false,
          error: 'Insufficient FRY balance to pay fees',
        };
      }

      const transactionId = generateTransactionId();

      // Execute fee collection in a transaction
      await prisma.$transaction(async (tx) => {
        // Debit FRY from user's wallet
        await tx.wallet.update({
          where: {
            userId_coinId_type: {
              userId,
              coinId: fryCoinId,
              type: 'SPOT',
            },
          },
          data: {
            balance: { decrement: fryAmount.toNumber() },
          },
        });

        // Record the fee transaction
        await tx.transaction.create({
          data: {
            id: transactionId,
            userId,
            coinId: fryCoinId,
            type: TransactionType.FEE,
            status: TransactionStatus.COMPLETED,
            amount: fryAmount.toNumber(),
            fee: 0,
            network: FRY_TOKEN.NETWORK,
            toAddress: FRY_TOKEN.FEE_COLLECTION_ADDRESS,
            memo: `${feeType} fee${referenceId ? ` - Ref: ${referenceId}` : ''}`,
            requiredConfirmations: DEFAULT_CONFIRMATIONS.ALGORAND,
            completedAt: new Date(),
          },
        });
      });

      return {
        success: true,
        transactionId,
        fryAmount: fryAmount.toString(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to collect fee',
      };
    }
  }

  /**
   * Collect and send fee on-chain to the fee collection address
   * This is for scenarios where fees need to be sent on-chain
   * @param userId - User ID
   * @param fryAmount - Amount of FRY to send
   * @param feeType - Type of fee
   * @returns Collection result with on-chain transaction hash
   */
  async collectAndSendFeeOnChain(
    userId: string,
    fryAmount: Decimal,
    feeType: FeeType
  ): Promise<FeeCollectionResult> {
    try {
      const fryCoinId = await this.getFryCoinId();

      // Check balance
      const hasBalance = await walletService.hasAvailableBalance(
        userId,
        fryCoinId,
        fryAmount
      );

      if (!hasBalance) {
        return {
          success: false,
          error: 'Insufficient FRY balance to pay fees',
        };
      }

      const transactionId = generateTransactionId();

      // Create pending transaction and debit balance
      await prisma.$transaction(async (tx) => {
        // Debit FRY from user's wallet
        await tx.wallet.update({
          where: {
            userId_coinId_type: {
              userId,
              coinId: fryCoinId,
              type: 'SPOT',
            },
          },
          data: {
            balance: { decrement: fryAmount.toNumber() },
          },
        });

        // Record the pending fee transaction
        await tx.transaction.create({
          data: {
            id: transactionId,
            userId,
            coinId: fryCoinId,
            type: TransactionType.FEE,
            status: TransactionStatus.PENDING,
            amount: fryAmount.toNumber(),
            fee: 0,
            network: FRY_TOKEN.NETWORK,
            toAddress: FRY_TOKEN.FEE_COLLECTION_ADDRESS,
            memo: `${feeType} fee - On-chain transfer`,
            requiredConfirmations: DEFAULT_CONFIRMATIONS.ALGORAND,
          },
        });
      });

      // Note: Actual on-chain sending requires hot wallet implementation
      // The transaction is recorded as pending and would be processed by a background job
      // that handles actual ASA transfers to the fee collection address

      return {
        success: true,
        transactionId,
        fryAmount: fryAmount.toString(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to collect and send fee',
      };
    }
  }

  /**
   * Get the user's current FRY balance
   * @param userId - User ID
   * @returns FRY balance as Decimal
   */
  async getUserFryBalance(userId: string): Promise<Decimal> {
    try {
      const fryCoinId = await this.getFryCoinId();
      const wallet = await prisma.wallet.findUnique({
        where: {
          userId_coinId_type: {
            userId,
            coinId: fryCoinId,
            type: 'SPOT',
          },
        },
      });

      if (!wallet) {
        return new Decimal(0);
      }

      return new Decimal(wallet.balance.toString()).minus(
        wallet.lockedBalance.toString()
      );
    } catch {
      return new Decimal(0);
    }
  }

  /**
   * Get total fees collected for a specific period
   * @param startDate - Start of period
   * @param endDate - End of period
   * @returns Total FRY fees collected
   */
  async getTotalFeesCollected(
    startDate: Date,
    endDate: Date
  ): Promise<Decimal> {
    const result = await prisma.transaction.aggregate({
      where: {
        type: TransactionType.FEE,
        status: TransactionStatus.COMPLETED,
        toAddress: FRY_TOKEN.FEE_COLLECTION_ADDRESS,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return new Decimal(result._sum.amount?.toString() || '0');
  }

  /**
   * Get fee transaction history for a user
   * @param userId - User ID
   * @param options - Query options
   * @returns List of fee transactions
   */
  async getUserFeeHistory(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    return prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.FEE,
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      skip: options.offset || 0,
    });
  }
}

export const fryFeeService = new FryFeeService();
