'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type OrderSide = 'buy' | 'sell';
type OrderType = 'limit' | 'market';

interface OrderFormProps {
  symbol: string;
  baseCurrency: string;
  quoteCurrency: string;
  lastPrice?: string;
  availableBalance?: string;
  onSubmit?: (order: {
    side: OrderSide;
    type: OrderType;
    price?: string;
    quantity: string;
  }) => void;
}

export function OrderForm({
  symbol,
  baseCurrency,
  quoteCurrency,
  lastPrice = '0.00',
  availableBalance = '0.00',
  onSubmit,
}: OrderFormProps) {
  const [side, setSide] = React.useState<OrderSide>('buy');
  const [orderType, setOrderType] = React.useState<OrderType>('limit');
  const [price, setPrice] = React.useState(lastPrice);
  const [quantity, setQuantity] = React.useState('');
  const [total, setTotal] = React.useState('0.00');

  React.useEffect(() => {
    if (price && quantity) {
      const totalValue = parseFloat(price) * parseFloat(quantity);
      setTotal(isNaN(totalValue) ? '0.00' : totalValue.toFixed(2));
    } else {
      setTotal('0.00');
    }
  }, [price, quantity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({
      side,
      type: orderType,
      price: orderType === 'limit' ? price : undefined,
      quantity,
    });
  };

  const handlePercentage = (percent: number) => {
    const balance = parseFloat(availableBalance);
    const priceNum = parseFloat(price) || parseFloat(lastPrice);

    if (side === 'buy' && priceNum > 0) {
      const maxQty = (balance * percent) / priceNum;
      setQuantity(maxQty.toFixed(8));
    } else if (side === 'sell') {
      const qty = balance * percent;
      setQuantity(qty.toFixed(8));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Place Order</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Buy/Sell Toggle */}
        <div className="mb-4 flex rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setSide('buy')}
            className={cn(
              'flex-1 rounded-md py-2 text-sm font-medium transition-all',
              side === 'buy'
                ? 'bg-buy text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setSide('sell')}
            className={cn(
              'flex-1 rounded-md py-2 text-sm font-medium transition-all',
              side === 'sell'
                ? 'bg-sell text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Sell
          </button>
        </div>

        {/* Order Type Toggle */}
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setOrderType('limit')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              orderType === 'limit'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Limit
          </button>
          <button
            type="button"
            onClick={() => setOrderType('market')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              orderType === 'market'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Market
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Price Input */}
          {orderType === 'limit' && (
            <Input
              label="Price"
              type="number"
              step="any"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              suffix={quoteCurrency}
            />
          )}

          {/* Quantity Input */}
          <Input
            label="Amount"
            type="number"
            step="any"
            placeholder="0.00"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            suffix={baseCurrency}
          />

          {/* Percentage Buttons */}
          <div className="flex gap-2">
            {[0.25, 0.5, 0.75, 1].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentage(pct)}
                className="flex-1 rounded border border-border py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                {pct * 100}%
              </button>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-medium">
              {total} {quoteCurrency}
            </span>
          </div>

          {/* Available Balance */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Available</span>
            <span>
              {availableBalance} {side === 'buy' ? quoteCurrency : baseCurrency}
            </span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant={side === 'buy' ? 'buy' : 'sell'}
            className="w-full"
            size="lg"
          >
            {side === 'buy' ? 'Buy' : 'Sell'} {baseCurrency}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
