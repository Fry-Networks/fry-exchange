import {
  prisma,
  TransactionStatus,
  TransactionType,
} from '@fry-exchange/database';
import { Decimal, generateTransactionId, NetworkType, WithdrawalRequest } from '@fry-exchange/common';
import { chainRegistry } from '../chains/ChainAdapter';
import { walletService } from './WalletService';
import { fryFeeService } from './FryFeeService';
import { vestigePriceService } from './VestigePriceService';

export interface WithdrawalResult {
  success: boolean;
  transactionId?: string;
  fryFeeAmount?: string;
  fryFeeTransactionId?: string;
  error?: string;
}

export class WithdrawalService {
  /**
   * Request a withdrawal
   */
  async requestWithdrawal(request: WithdrawalRequest): Promise<WithdrawalResult> {
    const { userId, coinId, network, address, amount, memo } = request;
    const withdrawalAmount = new Decimal(amount);

    // Validate network support
    const coinNetwork = await prisma.coinNetwork.findUnique({
      where: {
        coinId_network: { coinId, network: network as NetworkType },
      },
    });

    if (!coinNetwork || !coinNetwork.withdrawalEnabled) {
      return { success: false, error: 'Withdrawals not available for this network' };
    }

    // Validate address
    const adapter = chainRegistry.get(network as NetworkType);
    if (!adapter) {
      return { success: false, error: 'Network not supported' };
    }

    const validation = adapter.validateAddress(address);
    if (!validation.valid) {
      return { success: false, error: 'Invalid withdrawal address' };
    }

    // Check minimum withdrawal
    const minWithdrawal = new Decimal(coinNetwork.minWithdrawal.toString());
    if (withdrawalAmount.lessThan(minWithdrawal)) {
      return {
        success: false,
        error: `Minimum withdrawal is ${minWithdrawal.toString()}`,
      };
    }

    // Check maximum withdrawal
    const maxWithdrawal = new Decimal(coinNetwork.maxWithdrawal.toString());
    if (withdrawalAmount.greaterThan(maxWithdrawal)) {
      return {
        success: false,
        error: `Maximum withdrawal is ${maxWithdrawal.toString()}`,
      };
    }

    // Calculate network fee (in the coin being withdrawn)
    const fee = new Decimal(coinNetwork.withdrawalFee.toString());
    const totalDebit = withdrawalAmount.plus(fee);

    // Check balance for the withdrawal amount
    const hasBalance = await walletService.hasAvailableBalance(
      userId,
      coinId,
      totalDebit
    );

    if (!hasBalance) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Calculate FRY fee based on the withdrawal fee value in USD
    // For simplicity, we assume the withdrawal fee is denominated in USD equivalent
    const fryFeeCalc = await fryFeeService.calculateFeeInFry(fee);

    // Check if user has sufficient FRY balance for the fee
    const hasFryBalance = await fryFeeService.hassufficientFryBalance(
      userId,
      fryFeeCalc.fryFeeAmount
    );

    if (!hasFryBalance) {
      return {
        success: false,
        error: `Insufficient FRY balance for withdrawal fee. Required: ${fryFeeCalc.fryFeeAmount.toString()} FRY`,
      };
    }

    // Collect FRY fee first
    const fryFeeResult = await fryFeeService.collectFee(
      userId,
      fryFeeCalc.fryFeeAmount,
      'WITHDRAWAL'
    );

    if (!fryFeeResult.success) {
      return {
        success: false,
        error: `Failed to collect FRY fee: ${fryFeeResult.error}`,
      };
    }

    // Create withdrawal transaction and debit balance
    const transactionId = generateTransactionId();

    await prisma.$transaction(async (tx) => {
      // Debit balance (only the withdrawal amount, fee is paid in FRY)
      await tx.wallet.update({
        where: {
          userId_coinId_type: {
            userId,
            coinId,
            type: 'SPOT',
          },
        },
        data: {
          balance: { decrement: withdrawalAmount.toNumber() },
        },
      });

      // Create pending transaction
      await tx.transaction.create({
        data: {
          id: transactionId,
          userId,
          coinId,
          type: TransactionType.WITHDRAWAL,
          status: TransactionStatus.PENDING,
          amount: withdrawalAmount.toNumber(),
          fee: 0, // Fee is paid in FRY, not deducted from withdrawal
          network,
          toAddress: validation.normalized || address,
          memo: memo ? `${memo} | FRY Fee: ${fryFeeCalc.fryFeeAmount.toString()}` : `FRY Fee: ${fryFeeCalc.fryFeeAmount.toString()}`,
          requiredConfirmations: coinNetwork.minConfirmations,
        },
      });
    });

    return {
      success: true,
      transactionId,
      fryFeeAmount: fryFeeCalc.fryFeeAmount.toString(),
      fryFeeTransactionId: fryFeeResult.transactionId,
    };
  }

  /**
   * Process pending withdrawal (called by withdrawal processor)
   */
  async processWithdrawal(transactionId: string): Promise<boolean> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.status !== TransactionStatus.PENDING) {
      return false;
    }

    const adapter = chainRegistry.get(transaction.network as NetworkType);
    if (!adapter) {
      return false;
    }

    try {
      // Send transaction on-chain
      const txHash = await adapter.sendTransaction(
        transaction.toAddress!,
        new Decimal(transaction.amount.toString())
      );

      // Update transaction with hash
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.CONFIRMING,
          txHash,
        },
      });

      return true;
    } catch (error) {
      // Mark as failed and refund
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transactionId },
          data: { status: TransactionStatus.FAILED },
        }),
        prisma.wallet.update({
          where: {
            userId_coinId_type: {
              userId: transaction.userId,
              coinId: transaction.coinId,
              type: 'SPOT',
            },
          },
          data: {
            balance: {
              increment: new Decimal(transaction.amount.toString())
                .plus(transaction.fee.toString())
                .toNumber(),
            },
          },
        }),
      ]);

      return false;
    }
  }

  /**
   * Cancel a pending withdrawal
   */
  async cancelWithdrawal(
    transactionId: string,
    userId: string
  ): Promise<boolean> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (
      !transaction ||
      transaction.userId !== userId ||
      transaction.status !== TransactionStatus.PENDING
    ) {
      return false;
    }

    // Refund and cancel
    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.CANCELLED },
      }),
      prisma.wallet.update({
        where: {
          userId_coinId_type: {
            userId: transaction.userId,
            coinId: transaction.coinId,
            type: 'SPOT',
          },
        },
        data: {
          balance: {
            increment: new Decimal(transaction.amount.toString())
              .plus(transaction.fee.toString())
              .toNumber(),
          },
        },
      }),
    ]);

    return true;
  }

  /**
   * Get user's withdrawal history
   */
  async getWithdrawalHistory(
    userId: string,
    options: { coinId?: string; limit?: number; offset?: number } = {}
  ) {
    return prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.WITHDRAWAL,
        ...(options.coinId && { coinId: options.coinId }),
      },
      include: { coin: true },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      skip: options.offset || 0,
    });
  }
}

export const withdrawalService = new WithdrawalService();
