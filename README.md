# Fry Exchange

A modern, scalable Centralized Cryptocurrency Exchange (CEX) platform.

## Features

- **Trading Engine**: High-performance order matching with support for limit and market orders
- **User Management**: Account creation, authentication, and KYC integration
- **Wallet System**: Multi-chain wallet support with hot/cold wallet architecture
- **Native AMM**: Automated Market Maker with liquidity pools
- **Free Public API**: REST API and WebSocket for real-time market data
- **Multi-Chain Support**: Easy integration for custom blockchain tokens and popular chains (Solana, Ethereum, etc.)

## Architecture

```
fry-exchange/
├── packages/
│   ├── core/              # Core trading engine and order matching
│   ├── api/               # REST API and WebSocket server
│   ├── wallet/            # Multi-chain wallet management
│   ├── amm/               # Automated Market Maker module
│   ├── user/              # User management and authentication
│   ├── coins/             # Coin/token integration system
│   ├── database/          # Database schemas and migrations
│   └── common/            # Shared utilities and types
├── apps/
│   ├── exchange-api/      # Main exchange API server
│   ├── matching-engine/   # Order matching service
│   ├── wallet-service/    # Wallet management service
│   └── admin/             # Admin dashboard
└── docs/                  # Documentation
```

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Database**: PostgreSQL (primary), Redis (caching/real-time)
- **Message Queue**: Redis Streams / Bull
- **API**: Express.js with WebSocket support
- **Authentication**: JWT with refresh tokens

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 7
- pnpm >= 8

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Run database migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

## Development

```bash
# Run all tests
pnpm test

# Run linting
pnpm lint

# Build all packages
pnpm build
```

## API Documentation

See [docs/api/](docs/api/) for full API documentation.

## License

Proprietary - All rights reserved
