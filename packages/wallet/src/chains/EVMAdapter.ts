import { ethers } from 'ethers';
import { Decimal, NetworkType, DEFAULT_CONFIRMATIONS } from '@fry-exchange/common';
import { ChainAdapter, TransactionInfo, AddressValidation } from './ChainAdapter';

// ERC20 ABI for balance and transfer
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

/**
 * EVM-compatible blockchain adapter (Ethereum, BSC, Polygon, etc.)
 */
export class EVMAdapter extends ChainAdapter {
  readonly network: NetworkType;
  readonly requiredConfirmations: number;

  private provider: ethers.JsonRpcProvider;
  private decimals: number = 18;

  constructor(network: NetworkType, rpcUrl: string, requiredConfirmations?: number) {
    super();
    this.network = network;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.requiredConfirmations =
      requiredConfirmations ?? this.getDefaultConfirmations(network);
  }

  private getDefaultConfirmations(network: NetworkType): number {
    switch (network) {
      case NetworkType.ETHEREUM:
        return DEFAULT_CONFIRMATIONS.ETHEREUM;
      case NetworkType.BSC:
        return DEFAULT_CONFIRMATIONS.BSC;
      case NetworkType.POLYGON:
        return DEFAULT_CONFIRMATIONS.POLYGON;
      case NetworkType.AVALANCHE:
        return DEFAULT_CONFIRMATIONS.AVALANCHE;
      case NetworkType.ARBITRUM:
        return DEFAULT_CONFIRMATIONS.ARBITRUM;
      case NetworkType.OPTIMISM:
        return DEFAULT_CONFIRMATIONS.OPTIMISM;
      case NetworkType.BASE:
        return DEFAULT_CONFIRMATIONS.BASE;
      default:
        return 12;
    }
  }

  validateAddress(address: string): AddressValidation {
    try {
      const normalized = ethers.getAddress(address);
      return { valid: true, normalized };
    } catch {
      return { valid: false };
    }
  }

  async generateAddress(userId: string): Promise<{ address: string }> {
    // In production, use HD wallet derivation from a master key
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
    };
  }

  async getTransaction(txHash: string): Promise<TransactionInfo | null> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      if (!tx) return null;

      const receipt = await tx.wait();
      if (!receipt) return null;

      const currentBlock = await this.provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;

      const block = await this.provider.getBlock(receipt.blockNumber);

      return {
        txHash,
        from: tx.from,
        to: tx.to || '',
        amount: new Decimal(ethers.formatEther(tx.value)),
        confirmations,
        blockNumber: receipt.blockNumber,
        timestamp: block?.timestamp || 0,
      };
    } catch {
      return null;
    }
  }

  async getCurrentBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  async getBalance(address: string, tokenAddress?: string): Promise<Decimal> {
    try {
      if (tokenAddress) {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
        const [balance, decimals] = await Promise.all([
          contract.balanceOf(address),
          contract.decimals(),
        ]);
        return new Decimal(ethers.formatUnits(balance, decimals));
      }

      const balance = await this.provider.getBalance(address);
      return new Decimal(ethers.formatEther(balance));
    } catch {
      return new Decimal(0);
    }
  }

  async sendTransaction(
    toAddress: string,
    amount: Decimal,
    tokenAddress?: string
  ): Promise<string> {
    // In production, implement actual transaction signing and sending
    // This requires access to the hot wallet private key
    throw new Error('sendTransaction not implemented - requires hot wallet setup');
  }
}

// Factory functions for common EVM chains
export function createEthereumAdapter(rpcUrl?: string): EVMAdapter {
  return new EVMAdapter(
    NetworkType.ETHEREUM,
    rpcUrl || 'https://mainnet.infura.io/v3/your-project-id'
  );
}

export function createBSCAdapter(rpcUrl?: string): EVMAdapter {
  return new EVMAdapter(
    NetworkType.BSC,
    rpcUrl || 'https://bsc-dataseed.binance.org'
  );
}

export function createPolygonAdapter(rpcUrl?: string): EVMAdapter {
  return new EVMAdapter(
    NetworkType.POLYGON,
    rpcUrl || 'https://polygon-rpc.com'
  );
}

export function createArbitrumAdapter(rpcUrl?: string): EVMAdapter {
  return new EVMAdapter(
    NetworkType.ARBITRUM,
    rpcUrl || 'https://arb1.arbitrum.io/rpc'
  );
}

export function createBaseAdapter(rpcUrl?: string): EVMAdapter {
  return new EVMAdapter(
    NetworkType.BASE,
    rpcUrl || 'https://mainnet.base.org'
  );
}
