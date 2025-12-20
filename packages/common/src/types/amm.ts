import { Decimal } from 'decimal.js';

export enum PoolStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DEPRECATED = 'DEPRECATED',
}

export interface LiquidityPool {
  id: string;
  symbol: string; // e.g., "BTC_USDT"
  baseCoinId: string;
  quoteCoinId: string;
  baseReserve: Decimal;
  quoteReserve: Decimal;
  lpTokenSupply: Decimal;
  fee: Decimal; // e.g., 0.003 for 0.3%
  status: PoolStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface LiquidityPosition {
  id: string;
  userId: string;
  poolId: string;
  lpTokenBalance: Decimal;
  sharePercent: Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddLiquidityInput {
  poolId: string;
  baseAmount: string;
  quoteAmount: string;
  slippageTolerance: string; // e.g., "0.01" for 1%
}

export interface RemoveLiquidityInput {
  poolId: string;
  lpTokenAmount: string;
  slippageTolerance: string;
}

export interface SwapInput {
  poolId: string;
  inputCoinId: string;
  inputAmount: string;
  minOutputAmount: string;
}

export interface SwapQuote {
  inputAmount: string;
  outputAmount: string;
  priceImpact: string;
  fee: string;
  effectivePrice: string;
}

export interface PoolStats {
  poolId: string;
  tvlUsd: string;
  volume24hUsd: string;
  fees24hUsd: string;
  apr: string;
}

// AMM uses constant product formula: x * y = k
export interface AMMCalculation {
  inputAmount: Decimal;
  outputAmount: Decimal;
  fee: Decimal;
  newBaseReserve: Decimal;
  newQuoteReserve: Decimal;
  priceImpact: Decimal;
}
