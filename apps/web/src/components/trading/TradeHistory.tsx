'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatNumber, getTimeAgo } from '@/lib/utils';

interface Trade {
  id: string;
  price: string;
  quantity: string;
  side: 'buy' | 'sell';
  timestamp: Date;
}

interface TradeHistoryProps {
  trades: Trade[];
}

export function TradeHistory({ trades = [] }: TradeHistoryProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Recent Trades</h3>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
        <span>Price</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Time</span>
      </div>

      {/* Trades List */}
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {trades.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No recent trades
          </div>
        ) : (
          trades.map((trade) => (
            <div
              key={trade.id}
              className="grid grid-cols-3 gap-2 px-4 py-1.5 text-xs hover:bg-muted/50"
            >
              <span className={cn(trade.side === 'buy' ? 'text-buy' : 'text-sell')}>
                {formatNumber(trade.price, { decimals: 2 })}
              </span>
              <span className="text-right">
                {formatNumber(trade.quantity, { decimals: 4 })}
              </span>
              <span className="text-right text-muted-foreground">
                {getTimeAgo(trade.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
