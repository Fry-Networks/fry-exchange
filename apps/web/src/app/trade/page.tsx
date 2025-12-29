'use client';

import * as React from 'react';
import { Header } from '@/components/layout/Header';
import { OrderForm } from '@/components/trading/OrderForm';
import { OrderBook } from '@/components/trading/OrderBook';
import { TradeHistory } from '@/components/trading/TradeHistory';
import { MarketSelector } from '@/components/trading/MarketSelector';
import { TradingChart } from '@/components/trading/TradingChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data
const mockMarkets = [
  {
    symbol: 'BTC_USDT',
    baseCurrency: 'BTC',
    quoteCurrency: 'USDT',
    lastPrice: '43250.00',
    priceChange: '2.45',
    volume: '1234567890',
    isFavorite: true,
  },
  {
    symbol: 'ETH_USDT',
    baseCurrency: 'ETH',
    quoteCurrency: 'USDT',
    lastPrice: '2280.50',
    priceChange: '-1.23',
    volume: '987654321',
    isFavorite: true,
  },
  {
    symbol: 'SOL_USDT',
    baseCurrency: 'SOL',
    quoteCurrency: 'USDT',
    lastPrice: '98.75',
    priceChange: '5.67',
    volume: '456789012',
  },
];

const mockBids = [
  { price: '43240.00', quantity: '0.5234', total: '22640.74' },
  { price: '43235.00', quantity: '1.2000', total: '51882.00' },
  { price: '43230.00', quantity: '0.8500', total: '36745.50' },
  { price: '43225.00', quantity: '2.1000', total: '90772.50' },
  { price: '43220.00', quantity: '0.3200', total: '13830.40' },
  { price: '43215.00', quantity: '1.5000', total: '64822.50' },
  { price: '43210.00', quantity: '0.7800', total: '33703.80' },
  { price: '43205.00', quantity: '0.9200', total: '39748.60' },
];

const mockAsks = [
  { price: '43260.00', quantity: '0.4500', total: '19467.00' },
  { price: '43265.00', quantity: '0.8900', total: '38505.85' },
  { price: '43270.00', quantity: '1.3400', total: '57981.80' },
  { price: '43275.00', quantity: '0.6700', total: '28994.25' },
  { price: '43280.00', quantity: '0.2300', total: '9954.40' },
  { price: '43285.00', quantity: '1.1200', total: '48479.20' },
  { price: '43290.00', quantity: '0.5600', total: '24242.40' },
  { price: '43295.00', quantity: '0.9800', total: '42429.10' },
];

const mockTrades = [
  { id: '1', price: '43250.00', quantity: '0.1234', side: 'buy' as const, timestamp: new Date(Date.now() - 5000) },
  { id: '2', price: '43248.00', quantity: '0.5000', side: 'sell' as const, timestamp: new Date(Date.now() - 15000) },
  { id: '3', price: '43252.00', quantity: '0.2500', side: 'buy' as const, timestamp: new Date(Date.now() - 30000) },
  { id: '4', price: '43245.00', quantity: '1.0000', side: 'sell' as const, timestamp: new Date(Date.now() - 60000) },
  { id: '5', price: '43255.00', quantity: '0.3300', side: 'buy' as const, timestamp: new Date(Date.now() - 120000) },
];

export default function TradePage() {
  const [selectedSymbol, setSelectedSymbol] = React.useState('BTC_USDT');
  const selectedMarket = mockMarkets.find((m) => m.symbol === selectedSymbol)!;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isAuthenticated />

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-[1800px]">
          {/* Market Selector */}
          <div className="mb-4">
            <MarketSelector
              markets={mockMarkets}
              selectedSymbol={selectedSymbol}
              onSelect={setSelectedSymbol}
            />
          </div>

          {/* Trading Layout */}
          <div className="grid gap-4 lg:grid-cols-[1fr_300px_300px]">
            {/* Chart Area */}
            <div className="lg:row-span-2">
              <Card className="h-[600px] overflow-hidden">
                <TradingChart symbol={selectedSymbol} />
              </Card>
            </div>

            {/* Order Book */}
            <div className="h-[600px]">
              <OrderBook
                symbol={selectedSymbol}
                bids={mockBids}
                asks={mockAsks}
                lastPrice={selectedMarket.lastPrice}
                priceChange={selectedMarket.priceChange}
              />
            </div>

            {/* Order Form */}
            <div>
              <OrderForm
                symbol={selectedSymbol}
                baseCurrency={selectedMarket.baseCurrency}
                quoteCurrency={selectedMarket.quoteCurrency}
                lastPrice={selectedMarket.lastPrice}
                availableBalance="10000.00"
              />
            </div>

            {/* Trade History */}
            <div className="h-[300px]">
              <TradeHistory trades={mockTrades} />
            </div>
          </div>

          {/* Open Orders / Order History */}
          <div className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex gap-4">
                  <button className="text-sm font-medium text-foreground">
                    Open Orders (0)
                  </button>
                  <button className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Order History
                  </button>
                  <button className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Trade History
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  No open orders
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
