import {
  prisma,
  TransactionStatus,
  TransactionType,
} from '@fry-exchange/database';
import { Decimal, FRY_TOKEN, DEFAULT_CONFIRMATIONS } from '@fry-exchange/common';
import { AlgorandAdapter } from '../chains/AlgorandAdapter';

/**
 * Fee processing result
 */
export interface FeeProcessingResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  totalFryAmount: string;
  errors: string[];
}

/**
 * Service for processing accumulated FRY fees and sending them on-chain
 * to the designated fee collection address.
 *
 * In production, this service would be run by a background job that:
 * 1. Aggregates pending fee transactions
 * 2. Signs and sends them using the hot wallet
 * 3. Updates transaction statuses
 */
export class FeeProcessorService {
  private algorandAdapter: AlgorandAdapter;

  constructor() {
    this.algorandAdapter = new AlgorandAdapter();
  }

  /**
   * Get pending fee transactions that need to be sent on-chain
   * @param limit - Maximum number of transactions to fetch
   * @returns Pending fee transactions
   */
  async getPendingFeeTransactions(limit: number = 100) {
    return prisma.transaction.findMany({
      where: {
        type: TransactionType.FEE,
        status: TransactionStatus.PENDING,
        toAddress: FRY_TOKEN.FEE_COLLECTION_ADDRESS,
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  /**
   * Get total pending fees to be processed
   * @returns Total pending FRY amount
   */
  async getTotalPendingFees(): Promise<Decimal> {
    const result = await prisma.transaction.aggregate({
      where: {
        type: TransactionType.FEE,
        status: TransactionStatus.PENDING,
        toAddress: FRY_TOKEN.FEE_COLLECTION_ADDRESS,
      },
      _sum: {
        amount: true,
      },
    });

    return new Decimal(result._sum.amount?.toString() || '0');
  }

  /**
   * Mark a fee transaction as processed
   * @param transactionId - Transaction ID
   * @param txHash - On-chain transaction hash
   */
  async markAsProcessed(transactionId: string, txHash: string): Promise<void> {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.CONFIRMING,
        txHash,
      },
    });
  }

  /**
   * Mark a fee transaction as completed
   * @param transactionId - Transaction ID
   * @param confirmations - Number of confirmations
   */
  async markAsCompleted(
    transactionId: string,
    confirmations: number
  ): Promise<void> {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.COMPLETED,
        confirmations,
        completedAt: new Date(),
      },
    });
  }

  /**
   * Mark a fee transaction as failed
   * @param transactionId - Transaction ID
   * @param error - Error message
   */
  async markAsFailed(transactionId: string): Promise<void> {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.FAILED,
      },
    });
  }

  /**
   * Check and update confirmation status for confirming transactions
   * @returns Number of transactions confirmed
   */
  async updateConfirmations(): Promise<number> {
    const confirmingTxs = await prisma.transaction.findMany({
      where: {
        type: TransactionType.FEE,
        status: TransactionStatus.CONFIRMING,
        toAddress: FRY_TOKEN.FEE_COLLECTION_ADDRESS,
        txHash: { not: null },
      },
    });

    let confirmedCount = 0;

    for (const tx of confirmingTxs) {
      try {
        const txInfo = await this.algorandAdapter.getTransaction(tx.txHash!);

        if (txInfo) {
          if (txInfo.confirmations >= DEFAULT_CONFIRMATIONS.ALGORAND) {
            await this.markAsCompleted(tx.id, txInfo.confirmations);
            confirmedCount++;
          } else {
            await prisma.transaction.update({
              where: { id: tx.id },
              data: { confirmations: txInfo.confirmations },
            });
          }
        }
      } catch (error) {
        console.error(
          `Failed to check confirmation for transaction ${tx.id}:`,
          error
        );
      }
    }

    return confirmedCount;
  }

  /**
   * Get fee collection statistics
   * @returns Statistics about fee collection
   */
  async getStatistics() {
    const [pending, confirming, completed, failed] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          type: TransactionType.FEE,
          status: TransactionStatus.PENDING,
          toAddress: FRY_TOKEN.FEE_COLLECTION_ADDRESS,
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: {
          type: TransactionType.FEE,
          status: TransactionStatus.CONFIRMING,
          toAddress: FRY_TOKEN.FEE_COLLECTION_ADDRESS,
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: {
          type: TransactionType.FEE,
          status: TransactionStatus.COMPLETED,
          toAddress: FRY_TOKEN.FEE_COLLECTION_ADDRESS,
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: {
          type: TransactionType.FEE,
          status: TransactionStatus.FAILED,
          toAddress: FRY_TOKEN.FEE_COLLECTION_ADDRESS,
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      pending: {
        count: pending._count,
        amount: pending._sum.amount?.toString() || '0',
      },
      confirming: {
        count: confirming._count,
        amount: confirming._sum.amount?.toString() || '0',
      },
      completed: {
        count: completed._count,
        amount: completed._sum.amount?.toString() || '0',
      },
      failed: {
        count: failed._count,
        amount: failed._sum.amount?.toString() || '0',
      },
      feeCollectionAddress: FRY_TOKEN.FEE_COLLECTION_ADDRESS,
      fryAsaId: FRY_TOKEN.ASA_ID,
    };
  }
}

export const feeProcessorService = new FeeProcessorService();
