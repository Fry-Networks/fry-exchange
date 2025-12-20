import { CoinConfig, NetworkType } from '@fry-exchange/common';
import { coinService } from '../services/CoinService';
import { tradingPairService } from '../services/TradingPairService';

/**
 * Load coins from a configuration array
 * Useful for initializing the exchange with default coins
 */
export async function loadCoins(configs: CoinConfig[]): Promise<void> {
  for (const config of configs) {
    try {
      const coin = await coinService.addCoin(config);
      console.log(`Added coin: ${coin.symbol}`);

      // Create trading pairs if specified
      if (config.tradingPairs) {
        for (const pairConfig of config.tradingPairs) {
          try {
            const pair = await tradingPairService.createPair(
              config.symbol,
              pairConfig.quoteCoin,
              pairConfig
            );
            console.log(`Created trading pair: ${pair.symbol}`);
          } catch (error) {
            console.error(`Failed to create pair ${config.symbol}_${pairConfig.quoteCoin}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to add coin ${config.symbol}:`, error);
    }
  }
}

/**
 * Example coin configurations
 * Devs can use this as a template for adding new coins
 */
export const EXAMPLE_COINS: CoinConfig[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    decimals: 8,
    networks: [
      {
        network: NetworkType.BITCOIN,
        minConfirmations: 3,
        withdrawalFee: '0.0001',
        minDeposit: '0.0001',
        minWithdrawal: '0.0005',
        maxWithdrawal: '100',
      },
    ],
    tradingPairs: [
      {
        quoteCoin: 'USDT',
        minQuantity: '0.00001',
        maxQuantity: '1000',
        tickSize: '0.01',
        stepSize: '0.00001',
      },
    ],
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    networks: [
      {
        network: NetworkType.ETHEREUM,
        minConfirmations: 12,
        withdrawalFee: '0.005',
        minDeposit: '0.01',
        minWithdrawal: '0.01',
        maxWithdrawal: '1000',
      },
      {
        network: NetworkType.ARBITRUM,
        minConfirmations: 20,
        withdrawalFee: '0.0001',
        minDeposit: '0.001',
        minWithdrawal: '0.001',
        maxWithdrawal: '1000',
      },
    ],
    tradingPairs: [
      {
        quoteCoin: 'USDT',
        minQuantity: '0.0001',
        maxQuantity: '10000',
        tickSize: '0.01',
        stepSize: '0.0001',
      },
      {
        quoteCoin: 'BTC',
        minQuantity: '0.0001',
        maxQuantity: '10000',
        tickSize: '0.00001',
        stepSize: '0.0001',
      },
    ],
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    networks: [
      {
        network: NetworkType.SOLANA,
        minConfirmations: 32,
        withdrawalFee: '0.01',
        minDeposit: '0.1',
        minWithdrawal: '0.1',
        maxWithdrawal: '100000',
      },
    ],
    tradingPairs: [
      {
        quoteCoin: 'USDT',
        minQuantity: '0.01',
        maxQuantity: '100000',
        tickSize: '0.001',
        stepSize: '0.01',
      },
    ],
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    networks: [
      {
        network: NetworkType.ETHEREUM,
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        minConfirmations: 12,
        withdrawalFee: '10',
        minDeposit: '10',
        minWithdrawal: '20',
        maxWithdrawal: '1000000',
      },
      {
        network: NetworkType.SOLANA,
        contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        minConfirmations: 32,
        withdrawalFee: '1',
        minDeposit: '1',
        minWithdrawal: '10',
        maxWithdrawal: '1000000',
      },
      {
        network: NetworkType.BSC,
        contractAddress: '0x55d398326f99059fF775485246999027B3197955',
        minConfirmations: 15,
        withdrawalFee: '0.5',
        minDeposit: '1',
        minWithdrawal: '10',
        maxWithdrawal: '1000000',
      },
    ],
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    networks: [
      {
        network: NetworkType.ETHEREUM,
        contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        minConfirmations: 12,
        withdrawalFee: '10',
        minDeposit: '10',
        minWithdrawal: '20',
        maxWithdrawal: '1000000',
      },
      {
        network: NetworkType.SOLANA,
        contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        minConfirmations: 32,
        withdrawalFee: '1',
        minDeposit: '1',
        minWithdrawal: '10',
        maxWithdrawal: '1000000',
      },
      {
        network: NetworkType.ALGORAND,
        contractAddress: '31566704', // USDC ASA ID on Algorand
        minConfirmations: 10,
        withdrawalFee: '0.5',
        minDeposit: '1',
        minWithdrawal: '5',
        maxWithdrawal: '1000000',
      },
    ],
  },
  {
    symbol: 'ALGO',
    name: 'Algorand',
    decimals: 6,
    networks: [
      {
        network: NetworkType.ALGORAND,
        minConfirmations: 10,
        withdrawalFee: '0.001',
        minDeposit: '0.1',
        minWithdrawal: '0.1',
        maxWithdrawal: '10000000',
      },
    ],
    tradingPairs: [
      {
        quoteCoin: 'USDT',
        minQuantity: '1',
        maxQuantity: '10000000',
        tickSize: '0.0001',
        stepSize: '1',
      },
      {
        quoteCoin: 'USDC',
        minQuantity: '1',
        maxQuantity: '10000000',
        tickSize: '0.0001',
        stepSize: '1',
      },
    ],
  },
];

/**
 * Template for adding a custom token
 */
export function createCustomTokenConfig(
  symbol: string,
  name: string,
  network: NetworkType,
  contractAddress: string,
  decimals: number = 18
): CoinConfig {
  return {
    symbol,
    name,
    decimals,
    networks: [
      {
        network,
        contractAddress,
        minConfirmations: 12,
        withdrawalFee: '0',
        minDeposit: '0',
        minWithdrawal: '0',
        maxWithdrawal: '999999999',
      },
    ],
  };
}
