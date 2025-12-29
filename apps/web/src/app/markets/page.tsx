'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, formatNumber } from '@/lib/utils';
import {
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Flame,
  Zap,
  Award,
} from 'lucide-react';

// Mock market data
const allMarkets = [
  { symbol: 'BTC_USDT', baseCurrency: 'BTC', quoteCurrency: 'USDT', name: 'Bitcoin', lastPrice: '43250.00', priceChange: '1045.00', priceChangePercent: '2.45', high24h: '43800.00', low24h: '42100.00', volume24h: '12345.67', quoteVolume24h: '533987654', isFavorite: true, isHot: true, isNew: false },
  { symbol: 'ETH_USDT', baseCurrency: 'ETH', quoteCurrency: 'USDT', name: 'Ethereum', lastPrice: '2280.50', priceChange: '-28.50', priceChangePercent: '-1.23', high24h: '2350.00', low24h: '2250.00', volume24h: '45678.90', quoteVolume24h: '104123456', isFavorite: true, isHot: true, isNew: false },
  { symbol: 'SOL_USDT', baseCurrency: 'SOL', quoteCurrency: 'USDT', name: 'Solana', lastPrice: '98.75', priceChange: '5.25', priceChangePercent: '5.62', high24h: '102.00', low24h: '92.50', volume24h: '234567', quoteVolume24h: '23156432', isFavorite: false, isHot: true, isNew: false },
  { symbol: 'FRY_USDT', baseCurrency: 'FRY', quoteCurrency: 'USDT', name: 'Fry Token', lastPrice: '0.10', priceChange: '0.015', priceChangePercent: '17.65', high24h: '0.12', low24h: '0.085', volume24h: '15000000', quoteVolume24h: '1500000', isFavorite: true, isHot: true, isNew: true },
  { symbol: 'ALGO_USDT', baseCurrency: 'ALGO', quoteCurrency: 'USDT', name: 'Algorand', lastPrice: '0.19', priceChange: '-0.005', priceChangePercent: '-2.56', high24h: '0.20', low24h: '0.18', volume24h: '5000000', quoteVolume24h: '950000', isFavorite: false, isHot: false, isNew: false },
  { symbol: 'XRP_USDT', baseCurrency: 'XRP', quoteCurrency: 'USDT', name: 'Ripple', lastPrice: '0.62', priceChange: '0.02', priceChangePercent: '3.33', high24h: '0.65', low24h: '0.59', volume24h: '8000000', quoteVolume24h: '4960000', isFavorite: false, isHot: false, isNew: false },
  { symbol: 'ADA_USDT', baseCurrency: 'ADA', quoteCurrency: 'USDT', name: 'Cardano', lastPrice: '0.58', priceChange: '-0.01', priceChangePercent: '-1.69', high24h: '0.60', low24h: '0.56', volume24h: '12000000', quoteVolume24h: '6960000', isFavorite: false, isHot: false, isNew: false },
  { symbol: 'DOGE_USDT', baseCurrency: 'DOGE', quoteCurrency: 'USDT', name: 'Dogecoin', lastPrice: '0.082', priceChange: '0.003', priceChangePercent: '3.80', high24h: '0.085', low24h: '0.078', volume24h: '50000000', quoteVolume24h: '4100000', isFavorite: false, isHot: true, isNew: false },
  { symbol: 'AVAX_USDT', baseCurrency: 'AVAX', quoteCurrency: 'USDT', name: 'Avalanche', lastPrice: '35.20', priceChange: '1.80', priceChangePercent: '5.39', high24h: '36.50', low24h: '33.00', volume24h: '456789', quoteVolume24h: '16079012', isFavorite: false, isHot: false, isNew: false },
  { symbol: 'DOT_USDT', baseCurrency: 'DOT', quoteCurrency: 'USDT', name: 'Polkadot', lastPrice: '7.25', priceChange: '-0.15', priceChangePercent: '-2.03', high24h: '7.50', low24h: '7.10', volume24h: '2345678', quoteVolume24h: '17006165', isFavorite: false, isHot: false, isNew: false },
  { symbol: 'MATIC_USDT', baseCurrency: 'MATIC', quoteCurrency: 'USDT', name: 'Polygon', lastPrice: '0.92', priceChange: '0.05', priceChangePercent: '5.75', high24h: '0.95', low24h: '0.86', volume24h: '15000000', quoteVolume24h: '13800000', isFavorite: false, isHot: false, isNew: false },
  { symbol: 'LINK_USDT', baseCurrency: 'LINK', quoteCurrency: 'USDT', name: 'Chainlink', lastPrice: '14.50', priceChange: '0.75', priceChangePercent: '5.45', high24h: '15.00', low24h: '13.50', volume24h: '3456789', quoteVolume24h: '50123456', isFavorite: false, isHot: false, isNew: false },
  { symbol: 'UNI_USDT', baseCurrency: 'UNI', quoteCurrency: 'USDT', name: 'Uniswap', lastPrice: '6.20', priceChange: '-0.30', priceChangePercent: '-4.62', high24h: '6.60', low24h: '6.10', volume24h: '2000000', quoteVolume24h: '12400000', isFavorite: false, isHot: false, isNew: false },
  { symbol: 'ATOM_USDT', baseCurrency: 'ATOM', quoteCurrency: 'USDT', name: 'Cosmos', lastPrice: '9.80', priceChange: '0.40', priceChangePercent: '4.26', high24h: '10.20', low24h: '9.30', volume24h: '1500000', quoteVolume24h: '14700000', isFavorite: false, isHot: false, isNew: false },
  { symbol: 'LTC_USDT', baseCurrency: 'LTC', quoteCurrency: 'USDT', name: 'Litecoin', lastPrice: '72.50', priceChange: '-1.50', priceChangePercent: '-2.03', high24h: '75.00', low24h: '71.00', volume24h: '500000', quoteVolume24h: '36250000', isFavorite: false, isHot: false, isNew: false },
];

type SortField = 'symbol' | 'lastPrice' | 'priceChangePercent' | 'quoteVolume24h';
type SortDirection = 'asc' | 'desc';
type FilterTab = 'all' | 'favorites' | 'hot' | 'new' | 'gainers' | 'losers';

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<FilterTab>('all');
  const [sortField, setSortField] = React.useState<SortField>('quoteVolume24h');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');
  const [favorites, setFavorites] = React.useState<string[]>(['BTC_USDT', 'ETH_USDT', 'FRY_USDT']);

  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredMarkets = allMarkets
    .filter((market) => {
      const matchesSearch =
        market.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.baseCurrency.toLowerCase().includes(searchQuery.toLowerCase());

      switch (activeTab) {
        case 'favorites':
          return matchesSearch && favorites.includes(market.symbol);
        case 'hot':
          return matchesSearch && market.isHot;
        case 'new':
          return matchesSearch && market.isNew;
        case 'gainers':
          return matchesSearch && parseFloat(market.priceChangePercent) > 0;
        case 'losers':
          return matchesSearch && parseFloat(market.priceChangePercent) < 0;
        default:
          return matchesSearch;
      }
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'lastPrice':
          comparison = parseFloat(a.lastPrice) - parseFloat(b.lastPrice);
          break;
        case 'priceChangePercent':
          comparison = parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent);
          break;
        case 'quoteVolume24h':
          comparison = parseFloat(a.quoteVolume24h) - parseFloat(b.quoteVolume24h);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const tabs: { key: FilterTab; label: string; icon?: React.ReactNode }[] = [
    { key: 'all', label: 'All Markets' },
    { key: 'favorites', label: 'Favorites', icon: <Star className="h-4 w-4" /> },
    { key: 'hot', label: 'Hot', icon: <Flame className="h-4 w-4 text-orange-500" /> },
    { key: 'new', label: 'New', icon: <Zap className="h-4 w-4 text-yellow-500" /> },
    { key: 'gainers', label: 'Gainers', icon: <TrendingUp className="h-4 w-4 text-buy" /> },
    { key: 'losers', label: 'Losers', icon: <TrendingDown className="h-4 w-4 text-sell" /> },
  ];

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      {label}
      {sortField === field ? (
        sortDirection === 'asc' ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-50" />
      )}
    </button>
  );

  // Calculate market stats
  const totalVolume = allMarkets.reduce((sum, m) => sum + parseFloat(m.quoteVolume24h), 0);
  const avgChange = allMarkets.reduce((sum, m) => sum + parseFloat(m.priceChangePercent), 0) / allMarkets.length;
  const gainersCount = allMarkets.filter((m) => parseFloat(m.priceChangePercent) > 0).length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Markets</h1>
            <p className="text-muted-foreground">Explore and trade {allMarkets.length}+ cryptocurrency pairs</p>
          </div>

          {/* Market Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="mt-1 text-2xl font-bold">{formatPrice(totalVolume)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Trading Pairs</p>
                <p className="mt-1 text-2xl font-bold">{allMarkets.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Gainers / Losers</p>
                <p className="mt-1 text-2xl font-bold">
                  <span className="text-buy">{gainersCount}</span>
                  {' / '}
                  <span className="text-sell">{allMarkets.length - gainersCount}</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Avg. Change</p>
                <p className={`mt-1 text-2xl font-bold ${avgChange >= 0 ? 'text-buy' : 'text-sell'}`}>
                  {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Movers */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Top Movers</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {allMarkets
                .sort((a, b) => Math.abs(parseFloat(b.priceChangePercent)) - Math.abs(parseFloat(a.priceChangePercent)))
                .slice(0, 4)
                .map((market) => {
                  const isPositive = parseFloat(market.priceChangePercent) >= 0;
                  return (
                    <Link key={market.symbol} href={`/trade?symbol=${market.symbol}`}>
                      <Card className="hover:border-fry-red-500/50 transition-colors cursor-pointer">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
                                {market.baseCurrency.slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-medium">{market.baseCurrency}</p>
                                <p className="text-sm text-muted-foreground">{market.name}</p>
                              </div>
                            </div>
                            {market.isHot && <Flame className="h-4 w-4 text-orange-500" />}
                          </div>
                          <div className="mt-4 flex items-end justify-between">
                            <p className="text-lg font-bold">{formatPrice(market.lastPrice)}</p>
                            <div className={`flex items-center gap-1 ${isPositive ? 'text-buy' : 'text-sell'}`}>
                              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              <span className="font-medium">
                                {isPositive ? '+' : ''}{market.priceChangePercent}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* Filters & Search */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-fry-red-500 text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Markets Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left">
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </th>
                      <th className="px-4 py-3 text-left">
                        <SortButton field="symbol" label="Pair" />
                      </th>
                      <th className="px-4 py-3 text-right">
                        <SortButton field="lastPrice" label="Price" />
                      </th>
                      <th className="px-4 py-3 text-right">
                        <SortButton field="priceChangePercent" label="24h Change" />
                      </th>
                      <th className="px-4 py-3 text-right">24h High</th>
                      <th className="px-4 py-3 text-right">24h Low</th>
                      <th className="px-4 py-3 text-right">
                        <SortButton field="quoteVolume24h" label="24h Volume" />
                      </th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarkets.map((market) => {
                      const isPositive = parseFloat(market.priceChangePercent) >= 0;
                      const isFavorite = favorites.includes(market.symbol);
                      return (
                        <tr
                          key={market.symbol}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <button
                              onClick={() => toggleFavorite(market.symbol)}
                              className={`transition-colors ${
                                isFavorite ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'
                              }`}
                            >
                              <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <Link href={`/trade?symbol=${market.symbol}`} className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                {market.baseCurrency.slice(0, 2)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{market.baseCurrency}</span>
                                  <span className="text-muted-foreground">/ {market.quoteCurrency}</span>
                                  {market.isHot && <Flame className="h-3 w-3 text-orange-500" />}
                                  {market.isNew && <Zap className="h-3 w-3 text-yellow-500" />}
                                </div>
                                <span className="text-sm text-muted-foreground">{market.name}</span>
                              </div>
                            </Link>
                          </td>
                          <td className="px-4 py-4 text-right font-mono font-medium">
                            {formatPrice(market.lastPrice)}
                          </td>
                          <td className={`px-4 py-4 text-right font-medium ${isPositive ? 'text-buy' : 'text-sell'}`}>
                            <div className="flex items-center justify-end gap-1">
                              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {isPositive ? '+' : ''}{market.priceChangePercent}%
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right text-muted-foreground">
                            {formatPrice(market.high24h)}
                          </td>
                          <td className="px-4 py-4 text-right text-muted-foreground">
                            {formatPrice(market.low24h)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {formatPrice(market.quoteVolume24h)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Link href={`/trade?symbol=${market.symbol}`}>
                              <Button variant="fry" size="sm">
                                Trade
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredMarkets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium">No markets found</p>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
