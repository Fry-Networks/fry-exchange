// Trading constants
export const MAX_OPEN_ORDERS_PER_USER = 200;
export const MAX_OPEN_ORDERS_PER_SYMBOL = 50;
export const ORDER_EXPIRY_DAYS = 90;

// Rate limits (per minute)
export const RATE_LIMIT_PUBLIC = 60;
export const RATE_LIMIT_AUTHENTICATED = 120;
export const RATE_LIMIT_ORDERS = 30;
export const RATE_LIMIT_WITHDRAWALS = 10;

// Wallet constants
export const DEFAULT_CONFIRMATIONS = {
  BITCOIN: 3,
  ETHEREUM: 12,
  SOLANA: 32,
  BSC: 15,
  POLYGON: 128,
  AVALANCHE: 20,
  ARBITRUM: 20,
  OPTIMISM: 20,
  BASE: 20,
  TRON: 20,
  ALGORAND: 10,
} as const;

// Fee defaults (in decimal form, e.g., 0.001 = 0.1%)
export const DEFAULT_MAKER_FEE = '0.001';
export const DEFAULT_TAKER_FEE = '0.001';
export const VIP_MAKER_FEE = '0.0005';
export const VIP_TAKER_FEE = '0.0008';

// AMM constants
export const DEFAULT_POOL_FEE = '0.003'; // 0.3%
export const MIN_LIQUIDITY = '1000'; // Minimum initial liquidity in USD equivalent

// FRY Token Fee Configuration
export const FRY_TOKEN = {
  // FRY ASA ID on Algorand
  ASA_ID: 2485314946,
  // Address where all fees are collected
  FEE_COLLECTION_ADDRESS: 'E2F2LT2INE75DBOYHQXTCTOP2PAP5MHAXQRXTTCCXFKHQTVG36DJONBQZE',
  // FRY token decimals
  DECIMALS: 6,
  // Symbol for display
  SYMBOL: 'FRY',
  // Network
  NETWORK: 'ALGORAND',
} as const;

// Vestige API Configuration for price fetching
export const VESTIGE_API = {
  BASE_URL: 'https://free-api.vestige.fi',
  // Cache duration in milliseconds (1 minute as per Vestige's minimum cache time)
  CACHE_DURATION_MS: 60_000,
} as const;

// API Response codes
export const API_CODES = {
  SUCCESS: 0,
  INVALID_REQUEST: 1001,
  AUTHENTICATION_REQUIRED: 1002,
  INVALID_CREDENTIALS: 1003,
  INSUFFICIENT_PERMISSIONS: 1004,
  RATE_LIMITED: 1005,
  ORDER_NOT_FOUND: 2001,
  INSUFFICIENT_BALANCE: 2002,
  INVALID_QUANTITY: 2003,
  INVALID_PRICE: 2004,
  SYMBOL_NOT_FOUND: 2005,
  ORDER_REJECTED: 2006,
  USER_NOT_FOUND: 3001,
  EMAIL_ALREADY_EXISTS: 3002,
  USERNAME_ALREADY_EXISTS: 3003,
  WITHDRAWAL_DISABLED: 4001,
  DEPOSIT_DISABLED: 4002,
  INVALID_ADDRESS: 4003,
  MINIMUM_NOT_MET: 4004,
  INTERNAL_ERROR: 5000,
} as const;

// WebSocket channels
export const WS_CHANNELS = {
  TICKER: 'ticker',
  ORDER_BOOK: 'orderbook',
  TRADES: 'trades',
  KLINE: 'kline',
  USER_ORDERS: 'orders',
  USER_TRADES: 'user_trades',
  USER_BALANCE: 'balance',
} as const;
