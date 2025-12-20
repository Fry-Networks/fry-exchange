# Adding New Coins to Fry Exchange

This guide explains how developers can easily add new coins and tokens to the exchange.

## Quick Start

### Using the Coin Configuration System

The simplest way to add coins is using the configuration system:

```typescript
import { loadCoins, createCustomTokenConfig, NetworkType } from '@fry-exchange/coins';

// Example: Add a custom Solana token
const myToken = createCustomTokenConfig(
  'MYTOKEN',           // Symbol
  'My Custom Token',   // Name
  NetworkType.SOLANA,  // Network
  'TokenMintAddress',  // Contract/Mint address
  9                    // Decimals
);

await loadCoins([myToken]);
```

### Full Configuration Example

For more control, use the full configuration:

```typescript
import { coinService, tradingPairService } from '@fry-exchange/coins';
import { NetworkType } from '@fry-exchange/common';

// Step 1: Add the coin
const coin = await coinService.addCoin({
  symbol: 'MYTOKEN',
  name: 'My Token',
  decimals: 18,
  networks: [
    {
      network: NetworkType.ETHEREUM,
      contractAddress: '0x1234567890abcdef...',
      minConfirmations: 12,
      withdrawalFee: '5',      // 5 tokens
      minDeposit: '10',
      minWithdrawal: '20',
      maxWithdrawal: '100000',
    },
    {
      network: NetworkType.BSC,
      contractAddress: '0xabcdef1234567890...',
      minConfirmations: 15,
      withdrawalFee: '1',
      minDeposit: '1',
      minWithdrawal: '5',
      maxWithdrawal: '100000',
    },
  ],
});

// Step 2: Create trading pairs
await tradingPairService.createPair('MYTOKEN', 'USDT', {
  minQuantity: '1',
  maxQuantity: '1000000',
  tickSize: '0.0001',
  stepSize: '0.01',
  makerFee: '0.001',  // 0.1%
  takerFee: '0.001',
});

await tradingPairService.createPair('MYTOKEN', 'BTC', {
  minQuantity: '1',
  maxQuantity: '1000000',
  tickSize: '0.00000001',
  stepSize: '0.01',
});
```

## Supported Networks

| Network | Type | Notes |
|---------|------|-------|
| `BITCOIN` | Native | BTC mainnet |
| `ETHEREUM` | EVM | ERC-20 tokens |
| `SOLANA` | SPL | SPL tokens |
| `BSC` | EVM | BEP-20 tokens |
| `POLYGON` | EVM | Polygon tokens |
| `ARBITRUM` | EVM | L2 tokens |
| `OPTIMISM` | EVM | L2 tokens |
| `BASE` | EVM | Base chain tokens |
| `AVALANCHE` | EVM | AVAX C-Chain |
| `TRON` | TRC | TRC-20 tokens |
| `NATIVE` | Custom | Custom blockchains |

## Adding a Custom Blockchain

For tokens on custom or less common blockchains:

1. Create a chain adapter:

```typescript
import { ChainAdapter, chainRegistry } from '@fry-exchange/wallet';

class MyChainAdapter extends ChainAdapter {
  readonly network = NetworkType.NATIVE;
  readonly requiredConfirmations = 10;

  validateAddress(address: string) {
    // Implement address validation
  }

  async generateAddress(userId: string) {
    // Generate deposit address
  }

  async getTransaction(txHash: string) {
    // Fetch transaction info
  }

  async getCurrentBlockNumber() {
    // Get current block height
  }

  async getBalance(address: string) {
    // Get balance
  }

  async sendTransaction(to: string, amount: Decimal) {
    // Send from hot wallet
  }
}

// Register the adapter
chainRegistry.register(new MyChainAdapter());
```

2. Add the coin with `NATIVE` network type:

```typescript
await coinService.addCoin({
  symbol: 'MYCOIN',
  name: 'My Custom Coin',
  decimals: 8,
  networks: [
    {
      network: NetworkType.NATIVE,
      minConfirmations: 10,
      withdrawalFee: '0.1',
      minDeposit: '0.01',
      minWithdrawal: '0.1',
      maxWithdrawal: '10000',
      rpcUrl: 'https://my-chain-rpc.com',  // Optional
    },
  ],
});
```

## Admin API

Coins can also be added via the admin API:

```bash
# Add a coin
curl -X POST https://api.fry.exchange/api/v1/admin/coins \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "MYTOKEN",
    "name": "My Token",
    "decimals": 18,
    "networks": [{
      "network": "ETHEREUM",
      "contractAddress": "0x...",
      "minConfirmations": 12,
      "withdrawalFee": "5",
      "minDeposit": "10",
      "minWithdrawal": "20",
      "maxWithdrawal": "100000"
    }]
  }'

# Create a trading pair
curl -X POST https://api.fry.exchange/api/v1/admin/coins/pairs \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "baseCoin": "MYTOKEN",
    "quoteCoin": "USDT",
    "minQuantity": "1",
    "tickSize": "0.0001"
  }'
```

## Managing Coins

### Enable/Disable Features

```typescript
// Disable deposits
await coinService.setDepositEnabled(coinId, false);

// Disable withdrawals
await coinService.setWithdrawalEnabled(coinId, false);

// Disable trading
await coinService.setTradingEnabled(coinId, false);

// Put coin in maintenance
await coinService.updateStatus(coinId, CoinStatus.MAINTENANCE);
```

### Update Network Settings

```typescript
await coinService.updateNetwork(coinId, NetworkType.ETHEREUM, {
  withdrawalFee: '10',
  minWithdrawal: '50',
  maxWithdrawal: '50000',
});
```

### Manage Trading Pairs

```typescript
// Halt trading on a pair
await tradingPairService.haltTrading('MYTOKEN_USDT');

// Resume trading
await tradingPairService.resumeTrading('MYTOKEN_USDT');

// Update fees
await tradingPairService.updateFees('MYTOKEN_USDT', '0.0005', '0.001');

// Delist a pair
await tradingPairService.delist('MYTOKEN_USDT');
```

## Best Practices

1. **Test on testnet first** - Always test new coin integrations on testnets before mainnet.

2. **Set conservative limits initially** - Start with lower withdrawal limits and increase based on volume.

3. **Monitor deposits** - Set up monitoring for deposit addresses before enabling deposits.

4. **Verify contract addresses** - Double-check token contract addresses to prevent loss of funds.

5. **Configure appropriate confirmations** - Use network-appropriate confirmation counts for security.
