import algosdk from 'algosdk';
import { Decimal, NetworkType, DEFAULT_CONFIRMATIONS } from '@fry-exchange/common';
import { ChainAdapter, TransactionInfo, AddressValidation } from './ChainAdapter';

const MICROALGOS_PER_ALGO = 1_000_000;

/**
 * Algorand blockchain adapter
 * Supports native ALGO and Algorand Standard Assets (ASAs)
 */
export class AlgorandAdapter extends ChainAdapter {
  readonly network = NetworkType.ALGORAND;
  readonly requiredConfirmations = DEFAULT_CONFIRMATIONS.ALGORAND;

  private client: algosdk.Algodv2;
  private indexer: algosdk.Indexer;

  constructor(
    algodUrl: string = 'https://mainnet-api.algonode.cloud',
    indexerUrl: string = 'https://mainnet-idx.algonode.cloud'
  ) {
    super();
    this.client = new algosdk.Algodv2('', algodUrl, '');
    this.indexer = new algosdk.Indexer('', indexerUrl, '');
  }

  validateAddress(address: string): AddressValidation {
    try {
      const isValid = algosdk.isValidAddress(address);
      return {
        valid: isValid,
        normalized: isValid ? address : undefined,
      };
    } catch {
      return { valid: false };
    }
  }

  async generateAddress(userId: string): Promise<{ address: string }> {
    // In production, use HD wallet derivation from a master key
    // For now, generate a new account (store the private key securely!)
    const account = algosdk.generateAccount();
    return {
      address: account.addr,
    };
  }

  async getTransaction(txHash: string): Promise<TransactionInfo | null> {
    try {
      const txInfo = await this.indexer.lookupTransactionByID(txHash).do();

      if (!txInfo || !txInfo.transaction) {
        return null;
      }

      const tx = txInfo.transaction;
      const currentRound = (await this.client.status().do())['last-round'];
      const confirmations = currentRound - tx['confirmed-round'];

      // Determine amount (handle both payment and asset transfer)
      let amount: Decimal;
      if (tx['tx-type'] === 'pay') {
        amount = new Decimal(tx['payment-transaction']?.amount || 0).div(MICROALGOS_PER_ALGO);
      } else if (tx['tx-type'] === 'axfer') {
        // For ASA transfers, amount is in asset units (no conversion needed here)
        amount = new Decimal(tx['asset-transfer-transaction']?.amount || 0);
      } else {
        amount = new Decimal(0);
      }

      return {
        txHash,
        from: tx.sender,
        to: tx['payment-transaction']?.receiver || tx['asset-transfer-transaction']?.receiver || '',
        amount,
        confirmations,
        blockNumber: tx['confirmed-round'],
        timestamp: tx['round-time'] || 0,
      };
    } catch {
      return null;
    }
  }

  async getCurrentBlockNumber(): Promise<number> {
    const status = await this.client.status().do();
    return status['last-round'];
  }

  async getBalance(address: string, assetId?: string): Promise<Decimal> {
    try {
      const accountInfo = await this.client.accountInformation(address).do();

      if (assetId) {
        // ASA balance
        const assets = accountInfo.assets || [];
        const asset = assets.find((a: { 'asset-id': number }) =>
          a['asset-id'].toString() === assetId
        );
        return new Decimal(asset?.amount || 0);
      }

      // Native ALGO balance
      return new Decimal(accountInfo.amount || 0).div(MICROALGOS_PER_ALGO);
    } catch {
      return new Decimal(0);
    }
  }

  /**
   * Check if an account has opted in to an ASA
   */
  async isOptedIn(address: string, assetId: number): Promise<boolean> {
    try {
      const accountInfo = await this.client.accountInformation(address).do();
      const assets = accountInfo.assets || [];
      return assets.some((a: { 'asset-id': number }) => a['asset-id'] === assetId);
    } catch {
      return false;
    }
  }

  /**
   * Get ASA information
   */
  async getAssetInfo(assetId: number): Promise<{
    name: string;
    unitName: string;
    decimals: number;
    total: string;
  } | null> {
    try {
      const assetInfo = await this.client.getAssetByID(assetId).do();
      return {
        name: assetInfo.params.name || '',
        unitName: assetInfo.params['unit-name'] || '',
        decimals: assetInfo.params.decimals || 0,
        total: assetInfo.params.total?.toString() || '0',
      };
    } catch {
      return null;
    }
  }

  async sendTransaction(
    toAddress: string,
    amount: Decimal,
    assetId?: string
  ): Promise<string> {
    // In production, implement actual transaction signing and sending
    // This requires access to the hot wallet private key
    throw new Error('sendTransaction not implemented - requires hot wallet setup');
  }

  /**
   * Create an ASA transfer transaction (unsigned)
   * This is used for preparing transactions that will be signed by a hot wallet
   * @param fromAddress - Sender address
   * @param toAddress - Recipient address
   * @param amount - Amount to send (in smallest units)
   * @param assetId - ASA ID
   * @returns Unsigned transaction bytes
   */
  async createAsaTransferTransaction(
    fromAddress: string,
    toAddress: string,
    amount: Decimal,
    assetId: number
  ): Promise<Uint8Array> {
    const suggestedParams = await this.client.getTransactionParams().do();

    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: fromAddress,
      to: toAddress,
      amount: BigInt(amount.floor().toString()),
      assetIndex: assetId,
      suggestedParams,
    });

    return txn.toByte();
  }

  /**
   * Create a payment transaction for native ALGO (unsigned)
   * @param fromAddress - Sender address
   * @param toAddress - Recipient address
   * @param amount - Amount in ALGO
   * @returns Unsigned transaction bytes
   */
  async createPaymentTransaction(
    fromAddress: string,
    toAddress: string,
    amount: Decimal
  ): Promise<Uint8Array> {
    const suggestedParams = await this.client.getTransactionParams().do();

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: fromAddress,
      to: toAddress,
      amount: BigInt(amount.mul(MICROALGOS_PER_ALGO).floor().toString()),
      suggestedParams,
    });

    return txn.toByte();
  }

  /**
   * Submit a signed transaction to the network
   * @param signedTxn - Signed transaction bytes
   * @returns Transaction ID
   */
  async submitTransaction(signedTxn: Uint8Array): Promise<string> {
    const response = await this.client.sendRawTransaction(signedTxn).do();
    return response.txId;
  }

  /**
   * Wait for transaction confirmation
   * @param txId - Transaction ID
   * @param rounds - Number of rounds to wait
   * @returns Transaction info
   */
  async waitForConfirmation(
    txId: string,
    rounds: number = 10
  ): Promise<Record<string, unknown>> {
    return algosdk.waitForConfirmation(this.client, txId, rounds);
  }

  /**
   * Create an opt-in transaction for an ASA
   * User must opt-in before receiving ASA tokens
   */
  async createOptInTransaction(address: string, assetId: number): Promise<Uint8Array> {
    const suggestedParams = await this.client.getTransactionParams().do();

    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: address,
      amount: 0,
      assetIndex: assetId,
      suggestedParams,
    });

    return txn.toByte();
  }
}
