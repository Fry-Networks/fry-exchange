import { prisma, Wallet, WalletType } from '@fry-exchange/database';
import { Decimal, generateWalletId, WalletBalance } from '@fry-exchange/common';

export class WalletService {
  /**
   * Get or create a wallet for a user and coin
   */
  async getOrCreate(
    userId: string,
    coinId: string,
    type: WalletType = WalletType.SPOT
  ): Promise<Wallet> {
    let wallet = await prisma.wallet.findUnique({
      where: {
        userId_coinId_type: { userId, coinId, type },
      },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          id: generateWalletId(),
          userId,
          coinId,
          type,
          balance: 0,
          lockedBalance: 0,
        },
      });
    }

    return wallet;
  }

  /**
   * Get all wallets for a user
   */
  async getUserWallets(
    userId: string,
    type?: WalletType
  ): Promise<Wallet[]> {
    return prisma.wallet.findMany({
      where: {
        userId,
        ...(type && { type }),
      },
      include: {
        coin: true,
      },
    });
  }

  /**
   * Get user balances with coin info
   */
  async getUserBalances(userId: string): Promise<WalletBalance[]> {
    const wallets = await prisma.wallet.findMany({
      where: { userId, type: WalletType.SPOT },
      include: { coin: true },
    });

    return wallets.map((wallet) => ({
      coinId: wallet.coinId,
      coinSymbol: wallet.coin.symbol,
      balance: wallet.balance.toString(),
      lockedBalance: wallet.lockedBalance.toString(),
      availableBalance: new Decimal(wallet.balance.toString())
        .minus(wallet.lockedBalance.toString())
        .toString(),
      estimatedValueUsd: '0', // Would need price service
    }));
  }

  /**
   * Credit balance (deposit, trade receipt)
   */
  async credit(
    userId: string,
    coinId: string,
    amount: Decimal,
    type: WalletType = WalletType.SPOT
  ): Promise<Wallet> {
    const wallet = await this.getOrCreate(userId, coinId, type);

    return prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: amount.toNumber(),
        },
      },
    });
  }

  /**
   * Debit balance (withdrawal, trade payment)
   */
  async debit(
    userId: string,
    coinId: string,
    amount: Decimal,
    type: WalletType = WalletType.SPOT
  ): Promise<Wallet> {
    const wallet = await this.getOrCreate(userId, coinId, type);
    const available = new Decimal(wallet.balance.toString()).minus(
      wallet.lockedBalance.toString()
    );

    if (available.lessThan(amount)) {
      throw new Error('Insufficient balance');
    }

    return prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          decrement: amount.toNumber(),
        },
      },
    });
  }

  /**
   * Lock balance for pending order
   */
  async lock(
    userId: string,
    coinId: string,
    amount: Decimal,
    type: WalletType = WalletType.SPOT
  ): Promise<Wallet> {
    const wallet = await this.getOrCreate(userId, coinId, type);
    const available = new Decimal(wallet.balance.toString()).minus(
      wallet.lockedBalance.toString()
    );

    if (available.lessThan(amount)) {
      throw new Error('Insufficient available balance');
    }

    return prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        lockedBalance: {
          increment: amount.toNumber(),
        },
      },
    });
  }

  /**
   * Unlock balance when order is cancelled
   */
  async unlock(
    userId: string,
    coinId: string,
    amount: Decimal,
    type: WalletType = WalletType.SPOT
  ): Promise<Wallet> {
    const wallet = await this.getOrCreate(userId, coinId, type);

    return prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        lockedBalance: {
          decrement: amount.toNumber(),
        },
      },
    });
  }

  /**
   * Execute trade: unlock and debit from locked balance, credit to other wallet
   */
  async executeTrade(
    userId: string,
    debitCoinId: string,
    debitAmount: Decimal,
    creditCoinId: string,
    creditAmount: Decimal
  ): Promise<void> {
    await prisma.$transaction([
      // Debit from locked balance
      prisma.wallet.update({
        where: {
          userId_coinId_type: {
            userId,
            coinId: debitCoinId,
            type: WalletType.SPOT,
          },
        },
        data: {
          balance: { decrement: debitAmount.toNumber() },
          lockedBalance: { decrement: debitAmount.toNumber() },
        },
      }),
      // Credit received asset
      prisma.wallet.upsert({
        where: {
          userId_coinId_type: {
            userId,
            coinId: creditCoinId,
            type: WalletType.SPOT,
          },
        },
        update: {
          balance: { increment: creditAmount.toNumber() },
        },
        create: {
          id: generateWalletId(),
          userId,
          coinId: creditCoinId,
          type: WalletType.SPOT,
          balance: creditAmount.toNumber(),
          lockedBalance: 0,
        },
      }),
    ]);
  }

  /**
   * Check if user has sufficient available balance
   */
  async hasAvailableBalance(
    userId: string,
    coinId: string,
    amount: Decimal,
    type: WalletType = WalletType.SPOT
  ): Promise<boolean> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId_coinId_type: { userId, coinId, type } },
    });

    if (!wallet) return false;

    const available = new Decimal(wallet.balance.toString()).minus(
      wallet.lockedBalance.toString()
    );

    return available.greaterThanOrEqualTo(amount);
  }
}

export const walletService = new WalletService();
