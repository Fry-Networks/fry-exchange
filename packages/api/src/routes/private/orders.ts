import { Router, Request, Response } from 'express';
import { createOrderSchema, cancelOrderSchema, API_CODES, Decimal } from '@fry-exchange/common';
import { orderRateLimiter } from '../../middleware/rateLimit';
import { requirePermission } from '../../middleware/auth';
import { MatchingEngine, OrderRequest } from '@fry-exchange/core';
import { prisma, OrderType, OrderSide, TimeInForce } from '@fry-exchange/database';
import { generateOrderId } from '@fry-exchange/common';

export const orderRoutes = Router();

// Shared matching engine instance (in production, this would be a separate service)
const matchingEngine = new MatchingEngine();

/**
 * POST /api/v1/orders
 * Create a new order
 */
orderRoutes.post(
  '/',
  requirePermission('TRADE' as any),
  orderRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const input = createOrderSchema.parse(req.body);

      // Build order request
      const orderRequest: OrderRequest = {
        orderId: generateOrderId(),
        userId,
        symbol: input.symbol.toUpperCase(),
        side: input.side as OrderSide,
        type: input.type as OrderType,
        price: input.price ? new Decimal(input.price) : null,
        quantity: new Decimal(input.quantity),
        stopPrice: input.stopPrice ? new Decimal(input.stopPrice) : null,
        timeInForce: (input.timeInForce || 'GTC') as TimeInForce,
        timestamp: Date.now(),
      };

      // Submit to matching engine
      const result = matchingEngine.submitOrder(orderRequest);

      if (result.status === 'rejected') {
        res.status(400).json({
          code: API_CODES.ORDER_REJECTED,
          message: result.rejectReason,
        });
        return;
      }

      res.status(201).json({
        code: API_CODES.SUCCESS,
        data: {
          orderId: result.takerOrder.id,
          symbol: result.takerOrder.symbol,
          side: result.takerOrder.side,
          type: result.takerOrder.type,
          status: result.takerOrder.status,
          price: result.takerOrder.price?.toString() || null,
          quantity: result.takerOrder.quantity.toString(),
          filledQuantity: result.takerOrder.filledQuantity.toString(),
          remainingQuantity: result.takerOrder.remainingQuantity.toString(),
          averagePrice: result.takerOrder.averagePrice?.toString() || null,
          trades: result.trades.map((t) => ({
            tradeId: t.tradeId,
            price: t.price.toString(),
            quantity: t.quantity.toString(),
            fee: t.takerFee.toString(),
          })),
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          code: API_CODES.INVALID_REQUEST,
          message: 'Invalid order parameters',
          errors: (error as any).errors,
        });
        return;
      }
      res.status(500).json({
        code: API_CODES.INTERNAL_ERROR,
        message: 'Failed to create order',
      });
    }
  }
);

/**
 * DELETE /api/v1/orders/:orderId
 * Cancel an order
 */
orderRoutes.delete(
  '/:orderId',
  requirePermission('TRADE' as any),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { orderId } = req.params;

      const result = matchingEngine.cancelOrder(orderId, userId);

      if (!result.success) {
        res.status(400).json({
          code: API_CODES.ORDER_NOT_FOUND,
          message: result.reason,
        });
        return;
      }

      res.json({
        code: API_CODES.SUCCESS,
        data: {
          orderId: result.order!.id,
          status: result.order!.status,
        },
      });
    } catch (error) {
      res.status(500).json({
        code: API_CODES.INTERNAL_ERROR,
        message: 'Failed to cancel order',
      });
    }
  }
);

/**
 * DELETE /api/v1/orders
 * Cancel all orders
 */
orderRoutes.delete(
  '/',
  requirePermission('TRADE' as any),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const symbol = req.query.symbol as string | undefined;

      const results = matchingEngine.cancelAllOrders(userId, symbol?.toUpperCase());

      res.json({
        code: API_CODES.SUCCESS,
        data: {
          cancelled: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        },
      });
    } catch (error) {
      res.status(500).json({
        code: API_CODES.INTERNAL_ERROR,
        message: 'Failed to cancel orders',
      });
    }
  }
);

/**
 * GET /api/v1/orders/open
 * Get open orders
 */
orderRoutes.get('/open', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const symbol = req.query.symbol as string | undefined;

    const orders = matchingEngine.getUserOrders(userId, symbol?.toUpperCase());

    res.json({
      code: API_CODES.SUCCESS,
      data: orders.map((order) => ({
        orderId: order.id,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        status: order.status,
        price: order.price?.toString() || null,
        quantity: order.quantity.toString(),
        filledQuantity: order.filledQuantity.toString(),
        remainingQuantity: order.remainingQuantity.toString(),
        createdAt: order.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch orders',
    });
  }
});

/**
 * GET /api/v1/orders/history
 * Get order history
 */
orderRoutes.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const symbol = req.query.symbol as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const offset = parseInt(req.query.offset as string) || 0;

    const orders = await prisma.order.findMany({
      where: {
        userId,
        ...(symbol && { symbol: symbol.toUpperCase() }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    res.json({
      code: API_CODES.SUCCESS,
      data: orders.map((order) => ({
        orderId: order.id,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        status: order.status,
        price: order.price?.toString() || null,
        quantity: order.quantity.toString(),
        filledQuantity: order.filledQuantity.toString(),
        averagePrice: order.averagePrice?.toString() || null,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch order history',
    });
  }
});

/**
 * GET /api/v1/orders/:orderId
 * Get order by ID
 */
orderRoutes.get('/:orderId', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { orderId } = req.params;

    // Check in-memory first
    let order = matchingEngine.getOrder(orderId);

    // Fall back to database
    if (!order) {
      const dbOrder = await prisma.order.findFirst({
        where: { id: orderId, userId },
      });

      if (!dbOrder) {
        res.status(404).json({
          code: API_CODES.ORDER_NOT_FOUND,
          message: 'Order not found',
        });
        return;
      }

      res.json({
        code: API_CODES.SUCCESS,
        data: {
          orderId: dbOrder.id,
          symbol: dbOrder.symbol,
          side: dbOrder.side,
          type: dbOrder.type,
          status: dbOrder.status,
          price: dbOrder.price?.toString() || null,
          quantity: dbOrder.quantity.toString(),
          filledQuantity: dbOrder.filledQuantity.toString(),
          remainingQuantity: dbOrder.remainingQuantity.toString(),
          averagePrice: dbOrder.averagePrice?.toString() || null,
          createdAt: dbOrder.createdAt.toISOString(),
          updatedAt: dbOrder.updatedAt.toISOString(),
        },
      });
      return;
    }

    if (order.userId !== userId) {
      res.status(403).json({
        code: API_CODES.INSUFFICIENT_PERMISSIONS,
        message: 'Access denied',
      });
      return;
    }

    res.json({
      code: API_CODES.SUCCESS,
      data: {
        orderId: order.id,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        status: order.status,
        price: order.price?.toString() || null,
        quantity: order.quantity.toString(),
        filledQuantity: order.filledQuantity.toString(),
        remainingQuantity: order.remainingQuantity.toString(),
        averagePrice: order.averagePrice?.toString() || null,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      code: API_CODES.INTERNAL_ERROR,
      message: 'Failed to fetch order',
    });
  }
});
