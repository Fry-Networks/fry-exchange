import { prisma, Coin, CoinNetwork, CoinStatus, NetworkType } from '@fry-exchange/database';
import { CoinConfig, NetworkConfig, DEFAULT_CONFIRMATIONS } from '@fry-exchange/common';

export class CoinService {
  /**
   * Add a new coin with its networks
   * This is the main method devs will use to add new coins
   */
  async addCoin(config: CoinConfig): Promise<Coin> {
    // Check if coin already exists
    const existing = await prisma.coin.findUnique({
      where: { symbol: config.symbol.toUpperCase() },
    });

    if (existing) {
      throw new Error(`Coin ${config.symbol} already exists`);
    }

    // Create coin with networks in a transaction
    const coin = await prisma.$transaction(async (tx) => {
      // Create the coin
      const newCoin = await tx.coin.create({
        data: {
          symbol: config.symbol.toUpperCase(),
          name: config.name,
          decimals: config.decimals,
          status: CoinStatus.ACTIVE,
          minDeposit: 0,
          minWithdrawal: 0,
          maxWithdrawal: 999999999,
          withdrawalFee: 0,
          depositEnabled: true,
          withdrawalEnabled: true,
          tradingEnabled: true,
        },
      });

      // Add networks
      for (const networkConfig of config.networks) {
        await tx.coinNetwork.create({
          data: {
            coinId: newCoin.id,
            network: networkConfig.network,
            contractAddress: networkConfig.contractAddress || null,
            depositEnabled: true,
            withdrawalEnabled: true,
            minConfirmations: networkConfig.minConfirmations || this.getDefaultConfirmations(networkConfig.network),
            withdrawalFee: parseFloat(networkConfig.withdrawalFee),
            minWithdrawal: parseFloat(networkConfig.minWithdrawal),
            maxWithdrawal: parseFloat(networkConfig.maxWithdrawal),
            memoRequired: networkConfig.memoRequired || false,
          },
        });
      }

      return newCoin;
    });

    return coin;
  }

  /**
   * Add a network to an existing coin
   */
  async addNetwork(coinId: string, config: NetworkConfig): Promise<CoinNetwork> {
    const coin = await prisma.coin.findUnique({ where: { id: coinId } });
    if (!coin) {
      throw new Error('Coin not found');
    }

    return prisma.coinNetwork.create({
      data: {
        coinId,
        network: config.network,
        contractAddress: config.contractAddress || null,
        depositEnabled: true,
        withdrawalEnabled: true,
        minConfirmations: config.minConfirmations || this.getDefaultConfirmations(config.network),
        withdrawalFee: parseFloat(config.withdrawalFee),
        minWithdrawal: parseFloat(config.minWithdrawal),
        maxWithdrawal: parseFloat(config.maxWithdrawal),
        memoRequired: config.memoRequired || false,
      },
    });
  }

  /**
   * Get coin by symbol
   */
  async getBySymbol(symbol: string): Promise<Coin | null> {
    return prisma.coin.findUnique({
      where: { symbol: symbol.toUpperCase() },
      include: { networks: true },
    });
  }

  /**
   * Get coin by ID
   */
  async getById(coinId: string): Promise<Coin | null> {
    return prisma.coin.findUnique({
      where: { id: coinId },
      include: { networks: true },
    });
  }

  /**
   * List all coins
   */
  async listCoins(options: {
    status?: CoinStatus;
    tradingEnabled?: boolean;
  } = {}): Promise<Coin[]> {
    return prisma.coin.findMany({
      where: {
        ...(options.status && { status: options.status }),
        ...(options.tradingEnabled !== undefined && { tradingEnabled: options.tradingEnabled }),
      },
      include: { networks: true },
      orderBy: { symbol: 'asc' },
    });
  }

  /**
   * Update coin status
   */
  async updateStatus(coinId: string, status: CoinStatus): Promise<Coin> {
    return prisma.coin.update({
      where: { id: coinId },
      data: { status },
    });
  }

  /**
   * Enable/disable deposits for a coin
   */
  async setDepositEnabled(coinId: string, enabled: boolean): Promise<Coin> {
    return prisma.coin.update({
      where: { id: coinId },
      data: { depositEnabled: enabled },
    });
  }

  /**
   * Enable/disable withdrawals for a coin
   */
  async setWithdrawalEnabled(coinId: string, enabled: boolean): Promise<Coin> {
    return prisma.coin.update({
      where: { id: coinId },
      data: { withdrawalEnabled: enabled },
    });
  }

  /**
   * Enable/disable trading for a coin
   */
  async setTradingEnabled(coinId: string, enabled: boolean): Promise<Coin> {
    return prisma.coin.update({
      where: { id: coinId },
      data: { tradingEnabled: enabled },
    });
  }

  /**
   * Update network configuration
   */
  async updateNetwork(
    coinId: string,
    network: NetworkType,
    updates: Partial<{
      depositEnabled: boolean;
      withdrawalEnabled: boolean;
      minConfirmations: number;
      withdrawalFee: string;
      minWithdrawal: string;
      maxWithdrawal: string;
    }>
  ): Promise<CoinNetwork> {
    return prisma.coinNetwork.update({
      where: { coinId_network: { coinId, network } },
      data: {
        ...(updates.depositEnabled !== undefined && { depositEnabled: updates.depositEnabled }),
        ...(updates.withdrawalEnabled !== undefined && { withdrawalEnabled: updates.withdrawalEnabled }),
        ...(updates.minConfirmations !== undefined && { minConfirmations: updates.minConfirmations }),
        ...(updates.withdrawalFee !== undefined && { withdrawalFee: parseFloat(updates.withdrawalFee) }),
        ...(updates.minWithdrawal !== undefined && { minWithdrawal: parseFloat(updates.minWithdrawal) }),
        ...(updates.maxWithdrawal !== undefined && { maxWithdrawal: parseFloat(updates.maxWithdrawal) }),
      },
    });
  }

  private getDefaultConfirmations(network: NetworkType): number {
    const confirmations: Record<string, number> = {
      [NetworkType.BITCOIN]: DEFAULT_CONFIRMATIONS.BITCOIN,
      [NetworkType.ETHEREUM]: DEFAULT_CONFIRMATIONS.ETHEREUM,
      [NetworkType.SOLANA]: DEFAULT_CONFIRMATIONS.SOLANA,
      [NetworkType.BSC]: DEFAULT_CONFIRMATIONS.BSC,
      [NetworkType.POLYGON]: DEFAULT_CONFIRMATIONS.POLYGON,
      [NetworkType.AVALANCHE]: DEFAULT_CONFIRMATIONS.AVALANCHE,
      [NetworkType.ARBITRUM]: DEFAULT_CONFIRMATIONS.ARBITRUM,
      [NetworkType.OPTIMISM]: DEFAULT_CONFIRMATIONS.OPTIMISM,
      [NetworkType.BASE]: DEFAULT_CONFIRMATIONS.BASE,
      [NetworkType.TRON]: DEFAULT_CONFIRMATIONS.TRON,
    };
    return confirmations[network] || 12;
  }
}

export const coinService = new CoinService();
