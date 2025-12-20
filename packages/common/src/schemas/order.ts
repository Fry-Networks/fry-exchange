import { z } from 'zod';
import { OrderSide, OrderType, TimeInForce } from '../types/order';

const decimalString = z.string().regex(/^\d+(\.\d+)?$/, 'Invalid decimal format');

export const createOrderSchema = z.object({
  symbol: z.string().min(1).max(20),
  side: z.nativeEnum(OrderSide),
  type: z.nativeEnum(OrderType),
  price: decimalString.optional(),
  quantity: decimalString,
  stopPrice: decimalString.optional(),
  timeInForce: z.nativeEnum(TimeInForce).default(TimeInForce.GTC),
  clientOrderId: z.string().max(36).optional(),
}).refine(
  (data) => {
    // Limit orders require price
    if (data.type === OrderType.LIMIT || data.type === OrderType.STOP_LIMIT) {
      return data.price !== undefined;
    }
    return true;
  },
  { message: 'Price is required for limit orders', path: ['price'] }
).refine(
  (data) => {
    // Stop orders require stop price
    if (data.type === OrderType.STOP_LIMIT || data.type === OrderType.STOP_MARKET) {
      return data.stopPrice !== undefined;
    }
    return true;
  },
  { message: 'Stop price is required for stop orders', path: ['stopPrice'] }
);

export const cancelOrderSchema = z.object({
  orderId: z.string().min(1),
  symbol: z.string().min(1).max(20).optional(),
});

export const cancelAllOrdersSchema = z.object({
  symbol: z.string().min(1).max(20).optional(),
});

export const getOrderSchema = z.object({
  orderId: z.string().min(1),
});

export const getOrdersSchema = z.object({
  symbol: z.string().min(1).max(20).optional(),
  status: z.string().optional(),
  limit: z.number().int().min(1).max(1000).default(100),
  offset: z.number().int().min(0).default(0),
});

export const getOrderBookSchema = z.object({
  symbol: z.string().min(1).max(20),
  limit: z.number().int().min(1).max(1000).default(100),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type GetOrdersInput = z.infer<typeof getOrdersSchema>;
export type GetOrderBookInput = z.infer<typeof getOrderBookSchema>;
