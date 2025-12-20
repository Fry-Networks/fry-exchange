import { Decimal, NetworkType } from '@fry-exchange/common';

export interface TransactionInfo {
  txHash: string;
  from: string;
  to: string;
  amount: Decimal;
  confirmations: number;
  blockNumber: number;
  timestamp: number;
}

export interface AddressValidation {
  valid: boolean;
  normalized?: string;
}

/**
 * Abstract adapter for blockchain interactions.
 * Implement this for each supported chain.
 */
export abstract class ChainAdapter {
  abstract readonly network: NetworkType;
  abstract readonly requiredConfirmations: number;

  /**
   * Validate an address for this chain
   */
  abstract validateAddress(address: string): AddressValidation;

  /**
   * Generate a new deposit address
   */
  abstract generateAddress(userId: string): Promise<{ address: string; memo?: string }>;

  /**
   * Get transaction info by hash
   */
  abstract getTransaction(txHash: string): Promise<TransactionInfo | null>;

  /**
   * Get current block number
   */
  abstract getCurrentBlockNumber(): Promise<number>;

  /**
   * Check token balance at an address
   */
  abstract getBalance(address: string, tokenAddress?: string): Promise<Decimal>;

  /**
   * Send tokens from hot wallet
   */
  abstract sendTransaction(
    toAddress: string,
    amount: Decimal,
    tokenAddress?: string
  ): Promise<string>;

  /**
   * Check if transaction has enough confirmations
   */
  async isConfirmed(txHash: string): Promise<boolean> {
    const tx = await this.getTransaction(txHash);
    if (!tx) return false;
    return tx.confirmations >= this.requiredConfirmations;
  }
}

/**
 * Registry of chain adapters
 */
export class ChainAdapterRegistry {
  private adapters: Map<NetworkType, ChainAdapter> = new Map();

  register(adapter: ChainAdapter): void {
    this.adapters.set(adapter.network, adapter);
  }

  get(network: NetworkType): ChainAdapter | undefined {
    return this.adapters.get(network);
  }

  getAll(): ChainAdapter[] {
    return Array.from(this.adapters.values());
  }

  has(network: NetworkType): boolean {
    return this.adapters.has(network);
  }
}

export const chainRegistry = new ChainAdapterRegistry();
