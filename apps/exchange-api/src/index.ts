import 'dotenv/config';
import { createServer } from 'http';
import { createApp, ExchangeWebSocketServer } from '@fry-exchange/api';

const PORT = parseInt(process.env.API_PORT || '3000', 10);
const HOST = process.env.API_HOST || '0.0.0.0';

async function main() {
  console.log('Starting Fry Exchange API Server...');

  // Create Express app
  const app = createApp();

  // Create HTTP server
  const server = createServer(app);

  // Initialize WebSocket server
  const wsServer = new ExchangeWebSocketServer(server);

  // Start server
  server.listen(PORT, HOST, () => {
    console.log(`🚀 Fry Exchange API running on http://${HOST}:${PORT}`);
    console.log(`📡 WebSocket available at ws://${HOST}:${PORT}/ws`);
    console.log('');
    console.log('Available endpoints:');
    console.log('  Public:');
    console.log('    GET  /api/v1/market/coins      - List coins');
    console.log('    GET  /api/v1/market/pairs      - List trading pairs');
    console.log('    GET  /api/v1/market/ticker/:s  - Get ticker');
    console.log('    GET  /api/v1/market/orderbook/:s - Get order book');
    console.log('    GET  /api/v1/market/trades/:s  - Get recent trades');
    console.log('    GET  /api/v1/market/klines/:s  - Get kline data');
    console.log('');
    console.log('  Auth:');
    console.log('    POST /api/v1/auth/register     - Register');
    console.log('    POST /api/v1/auth/login        - Login');
    console.log('    POST /api/v1/auth/refresh      - Refresh token');
    console.log('');
    console.log('  Private (requires auth):');
    console.log('    POST /api/v1/orders            - Create order');
    console.log('    GET  /api/v1/orders/open       - Get open orders');
    console.log('    GET  /api/v1/wallet/balances   - Get balances');
    console.log('    POST /api/v1/wallet/withdraw   - Request withdrawal');
    console.log('    POST /api/v1/amm/swap          - Execute swap');
    console.log('');
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
