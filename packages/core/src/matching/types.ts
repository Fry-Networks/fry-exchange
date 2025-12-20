import { Decimal, Order, OrderSide, OrderType, TimeInForce } from '@fry-exchange/common';

export interface MatchResult {
  takerOrder: Order;
  trades: TradeExecution[];
  status: 'filled' | 'partially_filled' | 'open' | 'rejected';
  rejectReason?: string;
}

export interface TradeExecution {
  tradeId: string;
  symbol: string;
  price: Decimal;
  quantity: Decimal;
  takerOrderId: string;
  makerOrderId: string;
  takerUserId: string;
  makerUserId: string;
  takerSide: OrderSide;
  takerFee: Decimal;
  makerFee: Decimal;
  timestamp: Date;
}

export interface OrderRequest {
  orderId: string;
  userId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: Decimal | null;
  quantity: Decimal;
  stopPrice: Decimal | null;
  timeInForce: TimeInForce;
  timestamp: number;
}

export interface MatchingConfig {
  makerFee: Decimal;
  takerFee: Decimal;
  minQuantity: Decimal;
  maxQuantity: Decimal;
  tickSize: Decimal;
  stepSize: Decimal;
  minPrice: Decimal;
  maxPrice: Decimal;
}

export interface CancelResult {
  success: boolean;
  order?: Order;
  reason?: string;
}
