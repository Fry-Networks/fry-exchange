import {
  Decimal,
  Order,
  OrderSide,
  OrderStatus,
  OrderType,
  TimeInForce,
  generateOrderId,
  generateTradeId,
  truncateToStep,
  truncateToTick,
} from '@fry-exchange/common';
import { OrderBook } from '../orderbook/OrderBook';
import { MatchResult, TradeExecution, OrderRequest, MatchingConfig, CancelResult } from './types';
import { EngineEventEmitter, EngineEvents } from '../events';

/**
 * High-performance order matching engine.
 * Handles order validation, matching, and trade execution.
 */
export class MatchingEngine {
  private orderBooks: Map<string, OrderBook> = new Map();
  private configs: Map<string, MatchingConfig> = new Map();
  private orders: Map<string, Order> = new Map();
  private userOrders: Map<string, Set<string>> = new Map(); // userId -> orderIds
  public readonly events: EngineEventEmitter;

  constructor() {
    this.events = new EngineEventEmitter();
  }

  /**
   * Register a new trading pair
   */
  registerSymbol(symbol: string, config: MatchingConfig): void {
    if (this.orderBooks.has(symbol)) {
      throw new Error(`Symbol ${symbol} already registered`);
    }
    this.orderBooks.set(symbol, new OrderBook(symbol));
    this.configs.set(symbol, config);
  }

  /**
   * Get the order book for a symbol
   */
  getOrderBook(symbol: string): OrderBook | undefined {
    return this.orderBooks.get(symbol);
  }

  /**
   * Submit a new order
   */
  submitOrder(request: OrderRequest): MatchResult {
    const config = this.configs.get(request.symbol);
    if (!config) {
      return this.rejectOrder(request, 'Symbol not found');
    }

    // Validate order
    const validationError = this.validateOrder(request, config);
    if (validationError) {
      return this.rejectOrder(request, validationError);
    }

    // Create order object
    const order = this.createOrder(request);

    // Handle different order types
    if (request.type === OrderType.MARKET) {
      return this.executeMarketOrder(order, config);
    } else if (request.type === OrderType.LIMIT) {
      return this.executeLimitOrder(order, config);
    } else {
      // Stop orders would be handled differently
      return this.rejectOrder(request, 'Order type not yet supported');
    }
  }

  /**
   * Cancel an existing order
   */
  cancelOrder(orderId: string, userId: string): CancelResult {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, reason: 'Order not found' };
    }

    if (order.userId !== userId) {
      return { success: false, reason: 'Unauthorized' };
    }

    if (order.status !== OrderStatus.OPEN && order.status !== OrderStatus.PARTIALLY_FILLED) {
      return { success: false, reason: 'Order cannot be cancelled' };
    }

    // Remove from order book
    const orderBook = this.orderBooks.get(order.symbol);
    if (orderBook) {
      orderBook.removeOrder(orderId);
    }

    // Update order status
    order.status = OrderStatus.CANCELLED;
    order.updatedAt = new Date();

    // Remove from user orders
    const userOrderSet = this.userOrders.get(userId);
    if (userOrderSet) {
      userOrderSet.delete(orderId);
    }

    this.events.emit('orderCancelled', order);

    return { success: true, order };
  }

  /**
   * Cancel all orders for a user
   */
  cancelAllOrders(userId: string, symbol?: string): CancelResult[] {
    const userOrderIds = this.userOrders.get(userId);
    if (!userOrderIds) {
      return [];
    }

    const results: CancelResult[] = [];
    for (const orderId of Array.from(userOrderIds)) {
      const order = this.orders.get(orderId);
      if (order && (!symbol || order.symbol === symbol)) {
        results.push(this.cancelOrder(orderId, userId));
      }
    }

    return results;
  }

  /**
   * Get an order by ID
   */
  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  /**
   * Get all open orders for a user
   */
  getUserOrders(userId: string, symbol?: string): Order[] {
    const userOrderIds = this.userOrders.get(userId);
    if (!userOrderIds) return [];

    const orders: Order[] = [];
    for (const orderId of userOrderIds) {
      const order = this.orders.get(orderId);
      if (
        order &&
        (!symbol || order.symbol === symbol) &&
        (order.status === OrderStatus.OPEN || order.status === OrderStatus.PARTIALLY_FILLED)
      ) {
        orders.push(order);
      }
    }

    return orders;
  }

  private validateOrder(request: OrderRequest, config: MatchingConfig): string | null {
    // Validate quantity
    if (request.quantity.lessThan(config.minQuantity)) {
      return `Quantity below minimum: ${config.minQuantity.toString()}`;
    }
    if (request.quantity.greaterThan(config.maxQuantity)) {
      return `Quantity above maximum: ${config.maxQuantity.toString()}`;
    }

    // Validate price for limit orders
    if (request.type === OrderType.LIMIT && request.price) {
      if (request.price.lessThan(config.minPrice)) {
        return `Price below minimum: ${config.minPrice.toString()}`;
      }
      if (request.price.greaterThan(config.maxPrice)) {
        return `Price above maximum: ${config.maxPrice.toString()}`;
      }
    }

    return null;
  }

  private createOrder(request: OrderRequest): Order {
    const quantity = truncateToStep(request.quantity, this.configs.get(request.symbol)!.stepSize);
    const price = request.price
      ? truncateToTick(request.price, this.configs.get(request.symbol)!.tickSize)
      : null;

    const order: Order = {
      id: request.orderId,
      userId: request.userId,
      symbol: request.symbol,
      side: request.side,
      type: request.type,
      status: OrderStatus.PENDING,
      price,
      quantity,
      filledQuantity: new Decimal(0),
      remainingQuantity: quantity,
      averagePrice: null,
      stopPrice: request.stopPrice,
      timeInForce: request.timeInForce,
      clientOrderId: null,
      createdAt: new Date(request.timestamp),
      updatedAt: new Date(request.timestamp),
      expiresAt: null,
    };

    return order;
  }

  private executeMarketOrder(order: Order, config: MatchingConfig): MatchResult {
    const orderBook = this.orderBooks.get(order.symbol)!;
    const trades: TradeExecution[] = [];
    let totalFilled = new Decimal(0);
    let totalCost = new Decimal(0);

    // Get opposing levels to match against
    const levels = orderBook.getMatchableLevels(order.side);

    for (const level of levels) {
      if (order.remainingQuantity.isZero()) break;

      const matches = level.matchQuantity(order.remainingQuantity);

      for (const match of matches) {
        const makerOrder = this.orders.get(match.orderId);
        if (!makerOrder) continue;

        const trade = this.createTrade(
          order,
          makerOrder,
          level.price,
          match.filledQuantity,
          config
        );

        trades.push(trade);
        totalFilled = totalFilled.plus(match.filledQuantity);
        totalCost = totalCost.plus(level.price.mul(match.filledQuantity));

        // Update maker order
        makerOrder.filledQuantity = makerOrder.filledQuantity.plus(match.filledQuantity);
        makerOrder.remainingQuantity = makerOrder.remainingQuantity.minus(match.filledQuantity);

        if (makerOrder.remainingQuantity.isZero()) {
          makerOrder.status = OrderStatus.FILLED;
          this.orders.delete(makerOrder.id);
          const makerUserOrders = this.userOrders.get(makerOrder.userId);
          if (makerUserOrders) makerUserOrders.delete(makerOrder.id);
          this.events.emit('orderFilled', makerOrder);
        } else {
          makerOrder.status = OrderStatus.PARTIALLY_FILLED;
          this.events.emit('orderPartiallyFilled', makerOrder);
        }
        makerOrder.updatedAt = new Date();
      }

      // Remove empty level
      if (level.isEmpty) {
        orderBook.removeOrder(level.peekFirstOrder()?.orderId ?? '');
      }
    }

    // Update taker order
    order.filledQuantity = totalFilled;
    order.remainingQuantity = order.quantity.minus(totalFilled);
    order.averagePrice = totalFilled.isZero() ? null : totalCost.div(totalFilled);
    order.updatedAt = new Date();

    // Emit trades
    for (const trade of trades) {
      this.events.emit('trade', trade);
    }

    if (order.remainingQuantity.isZero()) {
      order.status = OrderStatus.FILLED;
      this.events.emit('orderFilled', order);
      return { takerOrder: order, trades, status: 'filled' };
    } else if (totalFilled.greaterThan(0)) {
      // Market orders that can't fully fill are rejected for remaining
      order.status = OrderStatus.PARTIALLY_FILLED;
      this.events.emit('orderPartiallyFilled', order);
      return { takerOrder: order, trades, status: 'partially_filled' };
    } else {
      order.status = OrderStatus.REJECTED;
      return { takerOrder: order, trades, status: 'rejected', rejectReason: 'No liquidity' };
    }
  }

  private executeLimitOrder(order: Order, config: MatchingConfig): MatchResult {
    const orderBook = this.orderBooks.get(order.symbol)!;
    const trades: TradeExecution[] = [];
    let totalFilled = new Decimal(0);
    let totalCost = new Decimal(0);

    // Try to match against existing orders
    const levels = orderBook.getMatchableLevels(order.side);

    for (const level of levels) {
      if (order.remainingQuantity.isZero()) break;

      // Check if price is matchable
      const canMatch =
        order.side === OrderSide.BUY
          ? level.price.lessThanOrEqualTo(order.price!)
          : level.price.greaterThanOrEqualTo(order.price!);

      if (!canMatch) break;

      const matches = level.matchQuantity(order.remainingQuantity);

      for (const match of matches) {
        const makerOrder = this.orders.get(match.orderId);
        if (!makerOrder) continue;

        const trade = this.createTrade(
          order,
          makerOrder,
          level.price, // Execute at maker's price
          match.filledQuantity,
          config
        );

        trades.push(trade);
        totalFilled = totalFilled.plus(match.filledQuantity);
        totalCost = totalCost.plus(level.price.mul(match.filledQuantity));

        // Update maker order
        makerOrder.filledQuantity = makerOrder.filledQuantity.plus(match.filledQuantity);
        makerOrder.remainingQuantity = makerOrder.remainingQuantity.minus(match.filledQuantity);

        if (makerOrder.remainingQuantity.isZero()) {
          makerOrder.status = OrderStatus.FILLED;
          orderBook.removeOrder(makerOrder.id);
          this.orders.delete(makerOrder.id);
          const makerUserOrders = this.userOrders.get(makerOrder.userId);
          if (makerUserOrders) makerUserOrders.delete(makerOrder.id);
          this.events.emit('orderFilled', makerOrder);
        } else {
          makerOrder.status = OrderStatus.PARTIALLY_FILLED;
          this.events.emit('orderPartiallyFilled', makerOrder);
        }
        makerOrder.updatedAt = new Date();
      }
    }

    // Update taker order
    order.filledQuantity = totalFilled;
    order.remainingQuantity = order.quantity.minus(totalFilled);
    order.averagePrice = totalFilled.isZero() ? null : totalCost.div(totalFilled);
    order.updatedAt = new Date();

    // Emit trades
    for (const trade of trades) {
      this.events.emit('trade', trade);
    }

    // Handle time in force
    if (order.remainingQuantity.isZero()) {
      order.status = OrderStatus.FILLED;
      this.events.emit('orderFilled', order);
      return { takerOrder: order, trades, status: 'filled' };
    }

    // Handle IOC/FOK
    if (order.timeInForce === TimeInForce.IOC || order.timeInForce === TimeInForce.FOK) {
      if (order.timeInForce === TimeInForce.FOK && totalFilled.lessThan(order.quantity)) {
        // FOK must fill completely or cancel
        // TODO: Rollback partial fills
        order.status = OrderStatus.CANCELLED;
        return { takerOrder: order, trades: [], status: 'rejected', rejectReason: 'FOK not filled' };
      }
      order.status = totalFilled.greaterThan(0) ? OrderStatus.PARTIALLY_FILLED : OrderStatus.CANCELLED;
      return { takerOrder: order, trades, status: totalFilled.greaterThan(0) ? 'partially_filled' : 'rejected' };
    }

    // GTC: Add remaining to order book
    order.status = totalFilled.greaterThan(0) ? OrderStatus.PARTIALLY_FILLED : OrderStatus.OPEN;
    orderBook.addOrder(order.id, order.side, order.price!, order.remainingQuantity, order.createdAt.getTime());
    this.orders.set(order.id, order);

    // Track user orders
    if (!this.userOrders.has(order.userId)) {
      this.userOrders.set(order.userId, new Set());
    }
    this.userOrders.get(order.userId)!.add(order.id);

    this.events.emit('orderOpen', order);

    return {
      takerOrder: order,
      trades,
      status: totalFilled.greaterThan(0) ? 'partially_filled' : 'open',
    };
  }

  private createTrade(
    takerOrder: Order,
    makerOrder: Order,
    price: Decimal,
    quantity: Decimal,
    config: MatchingConfig
  ): TradeExecution {
    const quoteQuantity = price.mul(quantity);

    return {
      tradeId: generateTradeId(),
      symbol: takerOrder.symbol,
      price,
      quantity,
      takerOrderId: takerOrder.id,
      makerOrderId: makerOrder.id,
      takerUserId: takerOrder.userId,
      makerUserId: makerOrder.userId,
      takerSide: takerOrder.side,
      takerFee: quoteQuantity.mul(config.takerFee),
      makerFee: quoteQuantity.mul(config.makerFee),
      timestamp: new Date(),
    };
  }

  private rejectOrder(request: OrderRequest, reason: string): MatchResult {
    const order = this.createOrder(request);
    order.status = OrderStatus.REJECTED;
    return { takerOrder: order, trades: [], status: 'rejected', rejectReason: reason };
  }
}
