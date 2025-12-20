import { Decimal } from 'decimal.js';

export enum WalletType {
  SPOT = 'SPOT',
  MARGIN = 'MARGIN',
  FUTURES = 'FUTURES',
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRADE = 'TRADE',
  FEE = 'FEE',
  TRANSFER = 'TRANSFER',
  AIRDROP = 'AIRDROP',
  STAKING_REWARD = 'STAKING_REWARD',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMING = 'CONFIRMING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface Wallet {
  id: string;
  userId: string;
  coinId: string;
  type: WalletType;
  balance: Decimal;
  lockedBalance: Decimal; // Reserved for open orders
  availableBalance: Decimal; // balance - lockedBalance
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletBalance {
  coinId: string;
  coinSymbol: string;
  balance: string;
  lockedBalance: string;
  availableBalance: string;
  estimatedValueUsd: string;
}

export interface DepositAddress {
  id: string;
  userId: string;
  coinId: string;
  network: string;
  address: string;
  memo: string | null;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  coinId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: Decimal;
  fee: Decimal;
  txHash: string | null;
  network: string | null;
  fromAddress: string | null;
  toAddress: string | null;
  confirmations: number;
  requiredConfirmations: number;
  memo: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export interface WithdrawalRequest {
  userId: string;
  coinId: string;
  network: string;
  address: string;
  amount: string;
  memo?: string;
}

export interface HotWalletConfig {
  coinId: string;
  network: string;
  address: string;
  threshold: Decimal; // Amount above which funds move to cold wallet
}

export interface ColdWalletConfig {
  coinId: string;
  network: string;
  address: string;
}
