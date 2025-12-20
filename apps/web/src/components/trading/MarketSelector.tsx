'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatNumber, formatPercent } from '@/lib/utils';
import { Search, Star, ChevronDown } from 'lucide-react';

interface Market {
  symbol: string;
  baseCurrency: string;
  quoteCurrency: string;
  lastPrice: string;
  priceChange: string;
  volume: string;
  isFavorite?: boolean;
}

interface MarketSelectorProps {
  markets: Market[];
  selectedSymbol?: string;
  onSelect?: (symbol: string) => void;
  onToggleFavorite?: (symbol: string) => void;
}

export function MarketSelector({
  markets,
  selectedSymbol,
  onSelect,
  onToggleFavorite,
}: MarketSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'favorites'>('all');

  const selectedMarket = markets.find((m) => m.symbol === selectedSymbol);

  const filteredMarkets = markets.filter((market) => {
    const matchesSearch =
      market.symbol.toLowerCase().includes(search.toLowerCase()) ||
      market.baseCurrency.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || market.isFavorite;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="relative">
      {/* Selected Market Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/50"
      >
        {selectedMarket ? (
          <>
            <div className="text-left">
              <div className="font-semibold">{selectedMarket.symbol}</div>
              <div className="text-sm text-muted-foreground">
                {selectedMarket.baseCurrency}/{selectedMarket.quoteCurrency}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {formatNumber(selectedMarket.lastPrice, { decimals: 2 })}
              </div>
              <div
                className={cn(
                  'text-sm',
                  parseFloat(selectedMarket.priceChange) >= 0
                    ? 'text-buy'
                    : 'text-sell'
                )}
              >
                {formatPercent(selectedMarket.priceChange)}
              </div>
            </div>
          </>
        ) : (
          <span className="text-muted-foreground">Select Market</span>
        )}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[400px] rounded-lg border border-border bg-card shadow-lg">
          {/* Search */}
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search markets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'flex-1 py-2 text-sm font-medium',
                filter === 'all'
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              All Markets
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={cn(
                'flex-1 py-2 text-sm font-medium',
                filter === 'favorites'
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <Star className="mr-1 inline-block h-3 w-3" />
              Favorites
            </button>
          </div>

          {/* Market List */}
          <div className="custom-scrollbar max-h-[300px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-card text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pl-3 text-left font-medium">Pair</th>
                  <th className="py-2 text-right font-medium">Price</th>
                  <th className="py-2 text-right font-medium">24h Change</th>
                  <th className="py-2 pr-3 text-right font-medium">Volume</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarkets.map((market) => (
                  <tr
                    key={market.symbol}
                    onClick={() => {
                      onSelect?.(market.symbol);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'cursor-pointer hover:bg-muted/50',
                      selectedSymbol === market.symbol && 'bg-muted'
                    )}
                  >
                    <td className="py-2 pl-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite?.(market.symbol);
                          }}
                          className="text-muted-foreground hover:text-yellow-500"
                        >
                          <Star
                            className={cn(
                              'h-4 w-4',
                              market.isFavorite && 'fill-yellow-500 text-yellow-500'
                            )}
                          />
                        </button>
                        <span className="font-medium">{market.symbol}</span>
                      </div>
                    </td>
                    <td className="py-2 text-right font-mono text-sm">
                      {formatNumber(market.lastPrice, { decimals: 2 })}
                    </td>
                    <td
                      className={cn(
                        'py-2 text-right text-sm',
                        parseFloat(market.priceChange) >= 0
                          ? 'text-buy'
                          : 'text-sell'
                      )}
                    >
                      {formatPercent(market.priceChange)}
                    </td>
                    <td className="py-2 pr-3 text-right text-sm text-muted-foreground">
                      {formatNumber(market.volume, { decimals: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
