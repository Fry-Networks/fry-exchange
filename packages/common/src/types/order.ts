import { Decimal } from 'decimal.js';

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
  STOP_LIMIT = 'STOP_LIMIT',
  STOP_MARKET = 'STOP_MARKET',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  OPEN = 'OPEN',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum TimeInForce {
  GTC = 'GTC', // Good Till Cancelled
  IOC = 'IOC', // Immediate Or Cancel
  FOK = 'FOK', // Fill Or Kill
  GTD = 'GTD', // Good Till Date
}

export interface Order {
  id: string;
  userId: string;
  symbol: string; // e.g., "BTC_USDT"
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  price: Decimal | null; // null for market orders
  quantity: Decimal;
  filledQuantity: Decimal;
  remainingQuantity: Decimal;
  averagePrice: Decimal | null;
  stopPrice: Decimal | null;
  timeInForce: TimeInForce;
  clientOrderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
}

export interface OrderCreateInput {
  userId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price?: string | number;
  quantity: string | number;
  stopPrice?: string | number;
  timeInForce?: TimeInForce;
  clientOrderId?: string;
  expiresAt?: Date;
}

export interface OrderBookEntry {
  price: Decimal;
  quantity: Decimal;
  orderCount: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookEntry[]; // Sorted high to low
  asks: OrderBookEntry[]; // Sorted low to high
  lastUpdateId: number;
  timestamp: Date;
}

export interface OrderBookLevel {
  price: string;
  quantity: string;
}
