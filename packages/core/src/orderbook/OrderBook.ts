import { Decimal, OrderSide, OrderBookEntry } from '@fry-exchange/common';
import { PriceLevel } from './PriceLevel';

interface OrderInfo {
  orderId: string;
  side: OrderSide;
  price: Decimal;
  quantity: Decimal;
  timestamp: number;
}

/**
 * In-memory order book for a single trading pair.
 * Maintains price-time priority ordering.
 */
export class OrderBook {
  public readonly symbol: string;
  private bids: Map<string, PriceLevel> = new Map(); // price string -> PriceLevel
  private asks: Map<string, PriceLevel> = new Map();
  private bidPrices: Decimal[] = []; // Sorted high to low
  private askPrices: Decimal[] = []; // Sorted low to high
  private orders: Map<string, OrderInfo> = new Map(); // orderId -> OrderInfo
  private _lastUpdateId: number = 0;

  constructor(symbol: string) {
    this.symbol = symbol;
  }

  get lastUpdateId(): number {
    return this._lastUpdateId;
  }

  get bestBid(): Decimal | null {
    return this.bidPrices[0] ?? null;
  }

  get bestAsk(): Decimal | null {
    return this.askPrices[0] ?? null;
  }

  get spread(): Decimal | null {
    if (!this.bestBid || !this.bestAsk) return null;
    return this.bestAsk.minus(this.bestBid);
  }

  /**
   * Add an order to the book
   */
  addOrder(
    orderId: string,
    side: OrderSide,
    price: Decimal,
    quantity: Decimal,
    timestamp: number = Date.now()
  ): void {
    const priceStr = price.toString();
    const levels = side === OrderSide.BUY ? this.bids : this.asks;
    const prices = side === OrderSide.BUY ? this.bidPrices : this.askPrices;

    let level = levels.get(priceStr);
    if (!level) {
      level = new PriceLevel(price);
      levels.set(priceStr, level);
      this.insertPrice(prices, price, side);
    }

    level.addOrder(orderId, quantity, timestamp);
    this.orders.set(orderId, { orderId, side, price, quantity, timestamp });
    this._lastUpdateId++;
  }

  /**
   * Remove an order from the book
   */
  removeOrder(orderId: string): boolean {
    const order = this.orders.get(orderId);
    if (!order) return false;

    const priceStr = order.price.toString();
    const levels = order.side === OrderSide.BUY ? this.bids : this.asks;
    const prices = order.side === OrderSide.BUY ? this.bidPrices : this.askPrices;

    const level = levels.get(priceStr);
    if (level) {
      level.removeOrder(orderId);
      if (level.isEmpty) {
        levels.delete(priceStr);
        this.removePrice(prices, order.price);
      }
    }

    this.orders.delete(orderId);
    this._lastUpdateId++;
    return true;
  }

  /**
   * Update an order's quantity
   */
  updateOrderQuantity(orderId: string, newQuantity: Decimal): boolean {
    const order = this.orders.get(orderId);
    if (!order) return false;

    const priceStr = order.price.toString();
    const levels = order.side === OrderSide.BUY ? this.bids : this.asks;

    const level = levels.get(priceStr);
    if (!level) return false;

    const success = level.updateOrderQuantity(orderId, newQuantity);
    if (success) {
      order.quantity = newQuantity;
      this._lastUpdateId++;
    }

    return success;
  }

  /**
   * Get order info
   */
  getOrder(orderId: string): OrderInfo | undefined {
    return this.orders.get(orderId);
  }

  /**
   * Check if an order exists
   */
  hasOrder(orderId: string): boolean {
    return this.orders.has(orderId);
  }

  /**
   * Get the best price levels that can match a given side
   * For a BUY order, returns the best asks
   * For a SELL order, returns the best bids
   */
  getMatchableLevels(side: OrderSide): PriceLevel[] {
    if (side === OrderSide.BUY) {
      return this.askPrices.map((p) => this.asks.get(p.toString())!);
    } else {
      return this.bidPrices.map((p) => this.bids.get(p.toString())!);
    }
  }

  /**
   * Get price level at a specific price
   */
  getLevel(side: OrderSide, price: Decimal): PriceLevel | undefined {
    const levels = side === OrderSide.BUY ? this.bids : this.asks;
    return levels.get(price.toString());
  }

  /**
   * Get a snapshot of the order book
   */
  getSnapshot(depth: number = 100): { bids: OrderBookEntry[]; asks: OrderBookEntry[] } {
    const bids: OrderBookEntry[] = this.bidPrices.slice(0, depth).map((price) => {
      const level = this.bids.get(price.toString())!;
      return {
        price,
        quantity: level.totalQuantity,
        orderCount: level.orderCount,
      };
    });

    const asks: OrderBookEntry[] = this.askPrices.slice(0, depth).map((price) => {
      const level = this.asks.get(price.toString())!;
      return {
        price,
        quantity: level.totalQuantity,
        orderCount: level.orderCount,
      };
    });

    return { bids, asks };
  }

  /**
   * Get the total quantity available at a price level
   */
  getQuantityAtPrice(side: OrderSide, price: Decimal): Decimal {
    const levels = side === OrderSide.BUY ? this.bids : this.asks;
    const level = levels.get(price.toString());
    return level?.totalQuantity ?? new Decimal(0);
  }

  /**
   * Clear the entire order book
   */
  clear(): void {
    this.bids.clear();
    this.asks.clear();
    this.bidPrices = [];
    this.askPrices = [];
    this.orders.clear();
    this._lastUpdateId++;
  }

  private insertPrice(prices: Decimal[], price: Decimal, side: OrderSide): void {
    // Binary search for insertion point
    let low = 0;
    let high = prices.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const cmp = prices[mid]!.comparedTo(price);

      if (side === OrderSide.BUY) {
        // Bids: high to low
        if (cmp > 0) low = mid + 1;
        else high = mid;
      } else {
        // Asks: low to high
        if (cmp < 0) low = mid + 1;
        else high = mid;
      }
    }

    prices.splice(low, 0, price);
  }

  private removePrice(prices: Decimal[], price: Decimal): void {
    const index = prices.findIndex((p) => p.equals(price));
    if (index !== -1) {
      prices.splice(index, 1);
    }
  }
}
