'use client';

import * as React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, formatNumber } from '@/lib/utils';
import {
  ArrowDownUp,
  ChevronDown,
  Settings,
  Info,
  RefreshCcw,
  Zap,
  Shield,
  Clock,
  Check,
  AlertCircle,
} from 'lucide-react';

// Mock token data
const tokens = [
  { symbol: 'BTC', name: 'Bitcoin', balance: '0.5234', price: 43250, icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', balance: '5.2500', price: 2280.5, icon: 'Ξ' },
  { symbol: 'USDT', name: 'Tether', balance: '10000.00', price: 1, icon: '₮' },
  { symbol: 'USDC', name: 'USD Coin', balance: '5000.00', price: 1, icon: '$' },
  { symbol: 'SOL', name: 'Solana', balance: '125.00', price: 98.75, icon: '◎' },
  { symbol: 'FRY', name: 'Fry Token', balance: '50000.00', price: 0.1, icon: '🍟' },
  { symbol: 'ALGO', name: 'Algorand', balance: '5000.00', price: 0.19, icon: 'Ⱥ' },
  { symbol: 'XRP', name: 'Ripple', balance: '2500.00', price: 0.62, icon: '✕' },
];

export default function SwapPage() {
  const [fromToken, setFromToken] = React.useState(tokens[2]); // USDT
  const [toToken, setToToken] = React.useState(tokens[0]); // BTC
  const [fromAmount, setFromAmount] = React.useState('');
  const [toAmount, setToAmount] = React.useState('');
  const [slippage, setSlippage] = React.useState('0.5');
  const [showFromSelect, setShowFromSelect] = React.useState(false);
  const [showToSelect, setShowToSelect] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Calculate exchange rate
  const exchangeRate = fromToken.price / toToken.price;
  const reverseRate = toToken.price / fromToken.price;

  // Update toAmount when fromAmount changes
  React.useEffect(() => {
    if (fromAmount && !isNaN(parseFloat(fromAmount))) {
      const calculated = parseFloat(fromAmount) * exchangeRate;
      setToAmount(calculated.toFixed(8));
    } else {
      setToAmount('');
    }
  }, [fromAmount, exchangeRate]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;

    setIsLoading(true);
    // Simulate swap
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setFromAmount('');
    setToAmount('');
  };

  const setPercentage = (percent: number) => {
    const balance = parseFloat(fromToken.balance);
    setFromAmount((balance * percent / 100).toFixed(8));
  };

  const priceImpact = parseFloat(fromAmount || '0') > 1000 ? 0.12 : 0.05;
  const minimumReceived = toAmount ? (parseFloat(toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(8) : '0';
  const fee = parseFloat(fromAmount || '0') * 0.003;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 py-6">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">Swap</h1>
            <p className="text-muted-foreground">Instantly swap tokens at the best rates</p>
          </div>

          {/* Swap Card */}
          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Swap Tokens</CardTitle>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="rounded-lg p-2 hover:bg-muted"
              >
                <Settings className="h-5 w-5 text-muted-foreground" />
              </button>
            </CardHeader>

            {/* Settings Dropdown */}
            {showSettings && (
              <div className="absolute right-4 top-14 z-20 w-64 rounded-lg border border-border bg-card p-4 shadow-lg">
                <p className="mb-3 text-sm font-medium">Slippage Tolerance</p>
                <div className="flex gap-2">
                  {['0.1', '0.5', '1.0'].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSlippage(value)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        slippage === value
                          ? 'bg-fry-red-500 text-white'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                  <Input
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    className="w-20 text-center"
                    suffix="%"
                  />
                </div>
              </div>
            )}

            <CardContent className="space-y-2">
              {/* From Token */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">From</span>
                  <span className="text-sm text-muted-foreground">
                    Balance: {fromToken.balance} {fromToken.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setShowFromSelect(!showFromSelect)}
                      className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 hover:bg-muted"
                    >
                      <span className="text-xl">{fromToken.icon}</span>
                      <span className="font-medium">{fromToken.symbol}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {showFromSelect && (
                      <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-border bg-card shadow-lg">
                        {tokens
                          .filter((t) => t.symbol !== toToken.symbol)
                          .map((token) => (
                            <button
                              key={token.symbol}
                              onClick={() => {
                                setFromToken(token);
                                setShowFromSelect(false);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-3 hover:bg-muted first:rounded-t-lg last:rounded-b-lg"
                            >
                              <span className="text-xl">{token.icon}</span>
                              <div className="text-left">
                                <p className="font-medium">{token.symbol}</p>
                                <p className="text-sm text-muted-foreground">{token.name}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-right text-2xl font-medium outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-2">
                    {[25, 50, 75, 100].map((percent) => (
                      <button
                        key={percent}
                        onClick={() => setPercentage(percent)}
                        className="rounded px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        {percent}%
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ≈ {formatPrice(parseFloat(fromAmount || '0') * fromToken.price)}
                  </span>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSwapTokens}
                  className="rounded-full border-4 border-background bg-muted p-2 hover:bg-muted/80 transition-colors"
                >
                  <ArrowDownUp className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* To Token */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">To</span>
                  <span className="text-sm text-muted-foreground">
                    Balance: {toToken.balance} {toToken.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setShowToSelect(!showToSelect)}
                      className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 hover:bg-muted"
                    >
                      <span className="text-xl">{toToken.icon}</span>
                      <span className="font-medium">{toToken.symbol}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {showToSelect && (
                      <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-border bg-card shadow-lg">
                        {tokens
                          .filter((t) => t.symbol !== fromToken.symbol)
                          .map((token) => (
                            <button
                              key={token.symbol}
                              onClick={() => {
                                setToToken(token);
                                setShowToSelect(false);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-3 hover:bg-muted first:rounded-t-lg last:rounded-b-lg"
                            >
                              <span className="text-xl">{token.icon}</span>
                              <div className="text-left">
                                <p className="font-medium">{token.symbol}</p>
                                <p className="text-sm text-muted-foreground">{token.name}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="number"
                    value={toAmount}
                    readOnly
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-right text-2xl font-medium outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <span className="text-sm text-muted-foreground">
                    ≈ {formatPrice(parseFloat(toAmount || '0') * toToken.price)}
                  </span>
                </div>
              </div>

              {/* Exchange Rate */}
              {fromAmount && (
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rate</span>
                    <div className="flex items-center gap-2">
                      <span>
                        1 {fromToken.symbol} = {exchangeRate.toFixed(8)} {toToken.symbol}
                      </span>
                      <button className="text-muted-foreground hover:text-foreground">
                        <RefreshCcw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span>Price Impact</span>
                      <Info className="h-4 w-4" />
                    </div>
                    <span className={priceImpact > 1 ? 'text-sell' : 'text-buy'}>
                      {priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Minimum Received</span>
                    <span>
                      {minimumReceived} {toToken.symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fee (0.3%)</span>
                    <span>
                      {fee.toFixed(4)} {fromToken.symbol}
                    </span>
                  </div>
                </div>
              )}

              {/* Swap Button */}
              <Button
                variant="fry"
                className="w-full"
                size="lg"
                onClick={handleSwap}
                loading={isLoading}
                disabled={!fromAmount || parseFloat(fromAmount) <= 0 || parseFloat(fromAmount) > parseFloat(fromToken.balance)}
              >
                {!fromAmount
                  ? 'Enter an amount'
                  : parseFloat(fromAmount) > parseFloat(fromToken.balance)
                  ? 'Insufficient balance'
                  : 'Swap'}
              </Button>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-center pt-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-fry-red-500/10">
                  <Zap className="h-6 w-6 text-fry-red-500" />
                </div>
                <h3 className="font-medium">Instant</h3>
                <p className="mt-1 text-sm text-muted-foreground">Swaps execute instantly</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center pt-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-fry-red-500/10">
                  <Shield className="h-6 w-6 text-fry-red-500" />
                </div>
                <h3 className="font-medium">Secure</h3>
                <p className="mt-1 text-sm text-muted-foreground">Protected by smart contracts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center pt-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-fry-red-500/10">
                  <Clock className="h-6 w-6 text-fry-red-500" />
                </div>
                <h3 className="font-medium">24/7</h3>
                <p className="mt-1 text-sm text-muted-foreground">Trade any time</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Swaps */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-base">Recent Swaps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { from: 'USDT', to: 'BTC', fromAmount: '1000', toAmount: '0.0231', status: 'completed', time: '2 min ago' },
                  { from: 'ETH', to: 'SOL', fromAmount: '2.5', toAmount: '57.69', status: 'completed', time: '15 min ago' },
                  { from: 'FRY', to: 'USDT', fromAmount: '10000', toAmount: '1000', status: 'completed', time: '1 hour ago' },
                ].map((swap, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center -space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border-2 border-card text-sm">
                          {tokens.find((t) => t.symbol === swap.from)?.icon}
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border-2 border-card text-sm">
                          {tokens.find((t) => t.symbol === swap.to)?.icon}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">
                          {swap.fromAmount} {swap.from} → {swap.toAmount} {swap.to}
                        </p>
                        <p className="text-sm text-muted-foreground">{swap.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-buy">
                      <Check className="h-4 w-4" />
                      <span className="text-sm">Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
