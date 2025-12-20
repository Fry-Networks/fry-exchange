# Fry Exchange API Documentation

## Base URL
```
https://api.fry.exchange/api/v1
```

## Authentication

### JWT Authentication
Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### API Key Authentication
Include your API key in the header:
```
X-API-Key: <your_api_key>
```

## Rate Limits

| Endpoint Type | Limit |
|--------------|-------|
| Public | 60 requests/minute |
| Authenticated | 120 requests/minute |
| Orders | 30 requests/minute |
| Withdrawals | 10 requests/5 minutes |

## Public Endpoints

### GET /market/coins
List all available coins.

**Response:**
```json
{
  "code": 0,
  "data": [
    {
      "id": "coin_id",
      "symbol": "BTC",
      "name": "Bitcoin",
      "decimals": 8,
      "depositEnabled": true,
      "withdrawalEnabled": true
    }
  ]
}
```

### GET /market/pairs
List all trading pairs.

### GET /market/ticker/:symbol
Get 24h ticker for a symbol.

### GET /market/orderbook/:symbol
Get order book. Query params: `limit` (default: 100, max: 1000)

### GET /market/trades/:symbol
Get recent trades. Query params: `limit` (default: 100, max: 1000)

### GET /market/klines/:symbol
Get candlestick data. Query params:
- `interval`: 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w
- `limit`: default 500, max 1000

## Authentication Endpoints

### POST /auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "trader123",
  "password": "SecurePass123"
}
```

### POST /auth/login
Login and receive tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "twoFactorCode": "123456"
}
```

### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "..."
}
```

## Trading Endpoints (Authenticated)

### POST /orders
Create a new order.

**Request:**
```json
{
  "symbol": "BTC_USDT",
  "side": "BUY",
  "type": "LIMIT",
  "price": "50000.00",
  "quantity": "0.1",
  "timeInForce": "GTC"
}
```

### DELETE /orders/:orderId
Cancel an order.

### DELETE /orders
Cancel all orders. Query params: `symbol` (optional)

### GET /orders/open
Get open orders. Query params: `symbol` (optional)

### GET /orders/history
Get order history.

## Wallet Endpoints (Authenticated)

### GET /wallet/balances
Get all balances.

### GET /wallet/deposit-address
Get deposit address. Query params: `coinId`, `network`

### POST /wallet/withdraw
Request withdrawal. Requires `WITHDRAW` API key permission.

**Request:**
```json
{
  "coinId": "coin_id",
  "network": "ETHEREUM",
  "address": "0x...",
  "amount": "100.00"
}
```

### GET /wallet/deposits
Get deposit history.

### GET /wallet/withdrawals
Get withdrawal history.

## AMM Endpoints (Authenticated)

### GET /amm/pools
List liquidity pools.

### GET /amm/quote
Get swap quote. Query params: `poolId`, `inputCoinId`, `inputAmount`

### POST /amm/swap
Execute a swap.

**Request:**
```json
{
  "poolId": "pool_id",
  "inputCoinId": "coin_id",
  "inputAmount": "100.00",
  "minOutputAmount": "99.00"
}
```

### POST /amm/liquidity/add
Add liquidity to a pool.

### POST /amm/liquidity/remove
Remove liquidity from a pool.

## WebSocket

Connect to: `wss://api.fry.exchange/ws`

### Authentication
Add token as query parameter: `wss://api.fry.exchange/ws?token=<access_token>`

### Subscribe
```json
{
  "type": "subscribe",
  "channels": ["ticker@BTC_USDT", "trades@BTC_USDT"]
}
```

### Channels

**Public:**
- `ticker@{symbol}` - Real-time ticker updates
- `orderbook@{symbol}` - Order book updates
- `trades@{symbol}` - Trade updates
- `kline@{symbol}@{interval}` - Candlestick updates

**Private (requires auth):**
- `orders` - User order updates
- `user_trades` - User trade updates
- `balance` - Balance updates

## Error Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1001 | Invalid request |
| 1002 | Authentication required |
| 1003 | Invalid credentials |
| 1004 | Insufficient permissions |
| 1005 | Rate limited |
| 2001 | Order not found |
| 2002 | Insufficient balance |
| 2003 | Invalid quantity |
| 2004 | Invalid price |
| 2005 | Symbol not found |
| 2006 | Order rejected |
| 5000 | Internal error |
