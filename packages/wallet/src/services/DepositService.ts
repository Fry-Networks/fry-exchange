import {
  prisma,
  TransactionStatus,
  TransactionType,
} from '@fry-exchange/database';
import { Decimal, generateTransactionId, NetworkType } from '@fry-exchange/common';
import { chainRegistry } from '../chains/ChainAdapter';
import { walletService } from './WalletService';

export interface DepositInfo {
  address: string;
  memo?: string;
  network: string;
  minDeposit: string;
  confirmations: number;
}

export class DepositService {
  /**
   * Get or generate deposit address for a user
   */
  async getDepositAddress(
    userId: string,
    coinId: string,
    network: string
  ): Promise<DepositInfo> {
    // Check for existing address
    let depositAddress = await prisma.depositAddress.findUnique({
      where: {
        userId_coinId_network: { userId, coinId, network },
      },
    });

    if (!depositAddress) {
      // Get chain adapter and generate address
      const adapter = chainRegistry.get(network as NetworkType);
      if (!adapter) {
        throw new Error(`Network ${network} not supported`);
      }

      const { address, memo } = await adapter.generateAddress(userId);

      depositAddress = await prisma.depositAddress.create({
        data: {
          userId,
          coinId,
          network,
          address,
          memo,
        },
      });
    }

    // Get network config for min deposit and confirmations
    const coinNetwork = await prisma.coinNetwork.findUnique({
      where: {
        coinId_network: { coinId, network: network as NetworkType },
      },
    });

    return {
      address: depositAddress.address,
      memo: depositAddress.memo ?? undefined,
      network,
      minDeposit: coinNetwork?.minWithdrawal.toString() || '0',
      confirmations: coinNetwork?.minConfirmations || 12,
    };
  }

  /**
   * Process an incoming deposit (called by deposit monitor)
   */
  async processDeposit(
    userId: string,
    coinId: string,
    network: string,
    txHash: string,
    amount: Decimal,
    confirmations: number
  ): Promise<void> {
    // Check if deposit already exists
    const existing = await prisma.transaction.findFirst({
      where: { txHash, type: TransactionType.DEPOSIT },
    });

    if (existing) {
      // Update confirmations
      if (existing.status === TransactionStatus.CONFIRMING) {
        await this.updateDepositConfirmations(existing.id, confirmations);
      }
      return;
    }

    // Get required confirmations
    const coinNetwork = await prisma.coinNetwork.findUnique({
      where: {
        coinId_network: { coinId, network: network as NetworkType },
      },
    });

    const requiredConfirmations = coinNetwork?.minConfirmations || 12;

    // Create pending deposit
    const status =
      confirmations >= requiredConfirmations
        ? TransactionStatus.COMPLETED
        : TransactionStatus.CONFIRMING;

    const transaction = await prisma.transaction.create({
      data: {
        id: generateTransactionId(),
        userId,
        coinId,
        type: TransactionType.DEPOSIT,
        status,
        amount: amount.toNumber(),
        fee: 0,
        txHash,
        network,
        confirmations,
        requiredConfirmations,
        completedAt: status === TransactionStatus.COMPLETED ? new Date() : null,
      },
    });

    // Credit balance if confirmed
    if (status === TransactionStatus.COMPLETED) {
      await walletService.credit(userId, coinId, amount);
    }
  }

  /**
   * Update deposit confirmations
   */
  async updateDepositConfirmations(
    transactionId: string,
    confirmations: number
  ): Promise<void> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (
      !transaction ||
      transaction.status !== TransactionStatus.CONFIRMING
    ) {
      return;
    }

    if (confirmations >= transaction.requiredConfirmations) {
      // Complete deposit
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.COMPLETED,
          confirmations,
          completedAt: new Date(),
        },
      });

      // Credit balance
      await walletService.credit(
        transaction.userId,
        transaction.coinId,
        new Decimal(transaction.amount.toString())
      );
    } else {
      // Just update confirmations
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { confirmations },
      });
    }
  }

  /**
   * Get user's deposit history
   */
  async getDepositHistory(
    userId: string,
    options: { coinId?: string; limit?: number; offset?: number } = {}
  ) {
    return prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.DEPOSIT,
        ...(options.coinId && { coinId: options.coinId }),
      },
      include: { coin: true },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      skip: options.offset || 0,
    });
  }
}

export const depositService = new DepositService();
