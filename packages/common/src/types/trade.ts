import { Decimal } from 'decimal.js';
import { OrderSide } from './order';

export interface Trade {
  id: string;
  symbol: string;
  price: Decimal;
  quantity: Decimal;
  quoteQuantity: Decimal; // price * quantity
  buyerOrderId: string;
  sellerOrderId: string;
  buyerUserId: string;
  sellerUserId: string;
  buyerFee: Decimal;
  sellerFee: Decimal;
  buyerFeeCoin: string;
  sellerFeeCoin: string;
  isBuyerMaker: boolean;
  timestamp: Date;
}

export interface TradePublic {
  id: string;
  symbol: string;
  price: string;
  quantity: string;
  quoteQuantity: string;
  isBuyerMaker: boolean;
  timestamp: Date;
}

export interface UserTrade {
  id: string;
  symbol: string;
  orderId: string;
  side: OrderSide;
  price: string;
  quantity: string;
  quoteQuantity: string;
  fee: string;
  feeCoin: string;
  isMaker: boolean;
  timestamp: Date;
}

export interface Ticker {
  symbol: string;
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openPrice: string;
  closePrice: string;
  bidPrice: string;
  askPrice: string;
  timestamp: Date;
}

export interface Kline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteVolume: string;
  trades: number;
}

export enum KlineInterval {
  ONE_MINUTE = '1m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  THIRTY_MINUTES = '30m',
  ONE_HOUR = '1h',
  FOUR_HOURS = '4h',
  ONE_DAY = '1d',
  ONE_WEEK = '1w',
  ONE_MONTH = '1M',
}
