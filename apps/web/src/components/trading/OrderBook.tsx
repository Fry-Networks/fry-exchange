'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';

interface OrderBookEntry {
  price: string;
  quantity: string;
  total: string;
}

interface OrderBookProps {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastPrice?: string;
  priceChange?: string;
}

export function OrderBook({
  symbol,
  bids = [],
  asks = [],
  lastPrice = '0.00',
  priceChange = '0.00',
}: OrderBookProps) {
  const maxBidTotal = Math.max(...bids.map((b) => parseFloat(b.total) || 0), 1);
  const maxAskTotal = Math.max(...asks.map((a) => parseFloat(a.total) || 0), 1);
  const priceChangeNum = parseFloat(priceChange);

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Order Book</h3>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
        <span>Price</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Sells) - Reversed so lowest ask is at bottom */}
      <div className="flex-1 overflow-hidden">
        <div className="custom-scrollbar h-[200px] overflow-y-auto">
          {[...asks].reverse().map((ask, i) => {
            const depthPercent = (parseFloat(ask.total) / maxAskTotal) * 100;
            return (
              <div
                key={`ask-${i}`}
                className="relative grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-muted/50"
              >
                {/* Depth indicator */}
                <div
                  className="absolute inset-y-0 right-0 bg-sell/10"
                  style={{ width: `${depthPercent}%` }}
                />
                <span className="relative text-sell">
                  {formatNumber(ask.price, { decimals: 2 })}
                </span>
                <span className="relative text-right">
                  {formatNumber(ask.quantity, { decimals: 4 })}
                </span>
                <span className="relative text-right text-muted-foreground">
                  {formatNumber(ask.total, { decimals: 2 })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Price */}
      <div className="border-y border-border bg-muted/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'text-lg font-bold',
              priceChangeNum >= 0 ? 'text-buy' : 'text-sell'
            )}
          >
            {formatNumber(lastPrice, { decimals: 2 })}
          </span>
          <span
            className={cn(
              'text-sm',
              priceChangeNum >= 0 ? 'text-buy' : 'text-sell'
            )}
          >
            {priceChangeNum >= 0 ? '↑' : '↓'}{' '}
            {Math.abs(priceChangeNum).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Bids (Buys) */}
      <div className="flex-1 overflow-hidden">
        <div className="custom-scrollbar h-[200px] overflow-y-auto">
          {bids.map((bid, i) => {
            const depthPercent = (parseFloat(bid.total) / maxBidTotal) * 100;
            return (
              <div
                key={`bid-${i}`}
                className="relative grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-muted/50"
              >
                {/* Depth indicator */}
                <div
                  className="absolute inset-y-0 right-0 bg-buy/10"
                  style={{ width: `${depthPercent}%` }}
                />
                <span className="relative text-buy">
                  {formatNumber(bid.price, { decimals: 2 })}
                </span>
                <span className="relative text-right">
                  {formatNumber(bid.quantity, { decimals: 4 })}
                </span>
                <span className="relative text-right text-muted-foreground">
                  {formatNumber(bid.total, { decimals: 2 })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
