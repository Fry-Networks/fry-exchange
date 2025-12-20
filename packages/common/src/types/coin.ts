import { Decimal } from 'decimal.js';

export enum CoinStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  DELISTED = 'DELISTED',
}

export enum NetworkType {
  NATIVE = 'NATIVE', // Custom blockchain
  SOLANA = 'SOLANA',
  ETHEREUM = 'ETHEREUM',
  BSC = 'BSC',
  POLYGON = 'POLYGON',
  AVALANCHE = 'AVALANCHE',
  ARBITRUM = 'ARBITRUM',
  OPTIMISM = 'OPTIMISM',
  BASE = 'BASE',
  TRON = 'TRON',
  BITCOIN = 'BITCOIN',
  ALGORAND = 'ALGORAND',
}

export interface Coin {
  id: string;
  symbol: string; // e.g., "BTC"
  name: string; // e.g., "Bitcoin"
  status: CoinStatus;
  decimals: number;
  minDeposit: Decimal;
  minWithdrawal: Decimal;
  maxWithdrawal: Decimal;
  withdrawalFee: Decimal;
  depositEnabled: boolean;
  withdrawalEnabled: boolean;
  tradingEnabled: boolean;
  iconUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CoinNetwork {
  id: string;
  coinId: string;
  network: NetworkType;
  contractAddress: string | null; // null for native coins
  depositEnabled: boolean;
  withdrawalEnabled: boolean;
  minConfirmations: number;
  withdrawalFee: Decimal;
  minWithdrawal: Decimal;
  maxWithdrawal: Decimal;
  memo: boolean; // Whether memo/tag is required
  createdAt: Date;
  updatedAt: Date;
}

export interface TradingPair {
  id: string;
  symbol: string; // e.g., "BTC_USDT"
  baseCoinId: string; // e.g., BTC
  quoteCoinId: string; // e.g., USDT
  status: TradingPairStatus;
  minQuantity: Decimal;
  maxQuantity: Decimal;
  minPrice: Decimal;
  maxPrice: Decimal;
  tickSize: Decimal; // Price precision
  stepSize: Decimal; // Quantity precision
  makerFee: Decimal; // e.g., 0.001 for 0.1%
  takerFee: Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export enum TradingPairStatus {
  ACTIVE = 'ACTIVE',
  HALTED = 'HALTED',
  DELISTED = 'DELISTED',
}

// Configuration for adding a new coin
export interface CoinConfig {
  symbol: string;
  name: string;
  decimals: number;
  networks: NetworkConfig[];
  tradingPairs?: TradingPairConfig[];
}

export interface NetworkConfig {
  network: NetworkType;
  contractAddress?: string;
  minConfirmations: number;
  withdrawalFee: string;
  minDeposit: string;
  minWithdrawal: string;
  maxWithdrawal: string;
  memoRequired?: boolean;
  rpcUrl?: string; // For custom networks
}

export interface TradingPairConfig {
  quoteCoin: string; // e.g., "USDT"
  minQuantity: string;
  maxQuantity: string;
  tickSize: string;
  stepSize: string;
  makerFee?: string;
  takerFee?: string;
}
