import { Decimal } from '@fry-exchange/common';

interface OrderAtLevel {
  orderId: string;
  quantity: Decimal;
  timestamp: number;
}

/**
 * Represents a single price level in the order book.
 * Orders at the same price are stored in FIFO order.
 */
export class PriceLevel {
  public readonly price: Decimal;
  private orders: OrderAtLevel[] = [];
  private _totalQuantity: Decimal = new Decimal(0);

  constructor(price: Decimal) {
    this.price = price;
  }

  get totalQuantity(): Decimal {
    return this._totalQuantity;
  }

  get orderCount(): number {
    return this.orders.length;
  }

  get isEmpty(): boolean {
    return this.orders.length === 0;
  }

  /**
   * Add an order to this price level
   */
  addOrder(orderId: string, quantity: Decimal, timestamp: number): void {
    this.orders.push({ orderId, quantity, timestamp });
    this._totalQuantity = this._totalQuantity.plus(quantity);
  }

  /**
   * Remove an order from this price level
   */
  removeOrder(orderId: string): Decimal {
    const index = this.orders.findIndex((o) => o.orderId === orderId);
    if (index === -1) {
      return new Decimal(0);
    }

    const order = this.orders[index]!;
    this.orders.splice(index, 1);
    this._totalQuantity = this._totalQuantity.minus(order.quantity);
    return order.quantity;
  }

  /**
   * Update an order's quantity
   */
  updateOrderQuantity(orderId: string, newQuantity: Decimal): boolean {
    const order = this.orders.find((o) => o.orderId === orderId);
    if (!order) {
      return false;
    }

    const diff = newQuantity.minus(order.quantity);
    order.quantity = newQuantity;
    this._totalQuantity = this._totalQuantity.plus(diff);
    return true;
  }

  /**
   * Get the first order in the queue (FIFO)
   */
  peekFirstOrder(): OrderAtLevel | undefined {
    return this.orders[0];
  }

  /**
   * Get all orders at this level
   */
  getOrders(): readonly OrderAtLevel[] {
    return this.orders;
  }

  /**
   * Match against orders at this level, consuming quantity
   * Returns the list of matched orders with their filled quantities
   */
  matchQuantity(
    quantityToMatch: Decimal
  ): { orderId: string; filledQuantity: Decimal }[] {
    const matches: { orderId: string; filledQuantity: Decimal }[] = [];
    let remaining = quantityToMatch;

    while (remaining.greaterThan(0) && this.orders.length > 0) {
      const order = this.orders[0]!;

      if (order.quantity.lessThanOrEqualTo(remaining)) {
        // Full fill of this order
        matches.push({ orderId: order.orderId, filledQuantity: order.quantity });
        remaining = remaining.minus(order.quantity);
        this._totalQuantity = this._totalQuantity.minus(order.quantity);
        this.orders.shift();
      } else {
        // Partial fill
        matches.push({ orderId: order.orderId, filledQuantity: remaining });
        order.quantity = order.quantity.minus(remaining);
        this._totalQuantity = this._totalQuantity.minus(remaining);
        remaining = new Decimal(0);
      }
    }

    return matches;
  }
}
