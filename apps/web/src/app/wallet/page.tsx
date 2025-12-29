'use client';

import * as React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, formatCrypto, shortenAddress } from '@/lib/utils';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  Search,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  QrCode,
  TrendingUp,
  TrendingDown,
  History,
} from 'lucide-react';

// Mock wallet data
const walletBalances = [
  { currency: 'BTC', name: 'Bitcoin', available: '0.5234', locked: '0.0000', total: '0.5234', usdValue: '22640.74', change: 2.45, icon: '₿' },
  { currency: 'ETH', name: 'Ethereum', available: '5.2500', locked: '0.5000', total: '5.7500', usdValue: '13112.87', change: -1.23, icon: 'Ξ' },
  { currency: 'USDT', name: 'Tether', available: '10000.00', locked: '2500.00', total: '12500.00', usdValue: '12500.00', change: 0.01, icon: '₮' },
  { currency: 'SOL', name: 'Solana', available: '125.00', locked: '0.0000', total: '125.00', usdValue: '12343.75', change: 5.67, icon: '◎' },
  { currency: 'FRY', name: 'Fry Token', available: '50000.00', locked: '10000.00', total: '60000.00', usdValue: '6000.00', change: 17.65, icon: '🍟' },
  { currency: 'ALGO', name: 'Algorand', available: '5000.00', locked: '0.0000', total: '5000.00', usdValue: '950.00', change: -2.56, icon: 'Ⱥ' },
  { currency: 'XRP', name: 'Ripple', available: '2500.00', locked: '500.00', total: '3000.00', usdValue: '1860.00', change: 3.33, icon: '✕' },
  { currency: 'ADA', name: 'Cardano', available: '8000.00', locked: '0.0000', total: '8000.00', usdValue: '4640.00', change: -1.69, icon: '₳' },
];

const recentTransactions = [
  { id: '1', type: 'deposit', currency: 'BTC', amount: '0.1000', status: 'completed', timestamp: new Date(Date.now() - 3600000), txHash: '0x1234...5678' },
  { id: '2', type: 'withdrawal', currency: 'ETH', amount: '2.5000', status: 'completed', timestamp: new Date(Date.now() - 86400000), txHash: '0x2345...6789' },
  { id: '3', type: 'deposit', currency: 'USDT', amount: '5000.00', status: 'pending', timestamp: new Date(Date.now() - 7200000), txHash: '0x3456...7890' },
  { id: '4', type: 'withdrawal', currency: 'SOL', amount: '50.00', status: 'completed', timestamp: new Date(Date.now() - 172800000), txHash: '0x4567...8901' },
];

export default function WalletPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [hideBalances, setHideBalances] = React.useState(false);
  const [hideSmallBalances, setHideSmallBalances] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'balances' | 'transactions'>('balances');
  const [selectedAsset, setSelectedAsset] = React.useState<string | null>(null);
  const [actionModal, setActionModal] = React.useState<'deposit' | 'withdraw' | null>(null);

  const totalBalance = walletBalances.reduce((sum, b) => sum + parseFloat(b.usdValue), 0);
  const totalChange = 3.45; // Mock total portfolio change

  const filteredBalances = walletBalances.filter((balance) => {
    const matchesSearch =
      balance.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      balance.name.toLowerCase().includes(searchQuery.toLowerCase());
    const hasBalance = !hideSmallBalances || parseFloat(balance.usdValue) >= 1;
    return matchesSearch && hasBalance;
  });

  const formatBalance = (value: string) => {
    if (hideBalances) return '••••••';
    return value;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isAuthenticated username="Trader" />

      <main className="flex-1 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Portfolio Overview */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
                <p className="text-muted-foreground">Manage your crypto assets</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setHideBalances(!hideBalances)}
                >
                  {hideBalances ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
              </div>
            </div>
          </div>

          {/* Portfolio Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {hideBalances ? '••••••' : formatPrice(totalBalance)}
                </p>
                <div className={`mt-1 flex items-center text-sm ${totalChange >= 0 ? 'text-buy' : 'text-sell'}`}>
                  {totalChange >= 0 ? (
                    <TrendingUp className="mr-1 h-4 w-4" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4" />
                  )}
                  {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}% today
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Available</p>
                  <ArrowUpRight className="h-4 w-4 text-buy" />
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {hideBalances ? '••••••' : formatPrice(totalBalance * 0.85)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Ready to trade</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">In Orders</p>
                  <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {hideBalances ? '••••••' : formatPrice(totalBalance * 0.15)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Locked in orders</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-fry-red-500/10 to-fry-red-600/10 border-fry-red-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">FRY Balance</p>
                  <span className="text-lg">🍟</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-fry-red-500">
                  {hideBalances ? '••••••' : '60,000 FRY'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">50% fee discount active</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 flex flex-wrap gap-3">
            <Button variant="buy" onClick={() => setActionModal('deposit')}>
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Deposit
            </Button>
            <Button variant="sell" onClick={() => setActionModal('withdraw')}>
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
            <Button variant="outline">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Transfer
            </Button>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-4 border-b border-border">
            <button
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === 'balances'
                  ? 'border-b-2 border-fry-red-500 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('balances')}
            >
              Balances
            </button>
            <button
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'border-b-2 border-fry-red-500 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('transactions')}
            >
              Recent Transactions
            </button>
          </div>

          {activeTab === 'balances' ? (
            <>
              {/* Filters */}
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hideSmallBalances}
                    onChange={(e) => setHideSmallBalances(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  Hide small balances
                </label>
              </div>

              {/* Balances Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Asset</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Available</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Locked</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Total</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">USD Value</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">24h</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBalances.map((balance) => (
                          <tr
                            key={balance.currency}
                            className="border-b border-border hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
                                  {balance.icon}
                                </div>
                                <div>
                                  <p className="font-medium">{balance.currency}</p>
                                  <p className="text-sm text-muted-foreground">{balance.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right font-mono">
                              {formatBalance(balance.available)}
                            </td>
                            <td className="px-4 py-4 text-right font-mono text-muted-foreground">
                              {formatBalance(balance.locked)}
                            </td>
                            <td className="px-4 py-4 text-right font-mono font-medium">
                              {formatBalance(balance.total)}
                            </td>
                            <td className="px-4 py-4 text-right font-medium">
                              {hideBalances ? '••••••' : formatPrice(balance.usdValue)}
                            </td>
                            <td className={`px-4 py-4 text-right ${balance.change >= 0 ? 'text-buy' : 'text-sell'}`}>
                              {balance.change >= 0 ? '+' : ''}{balance.change.toFixed(2)}%
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAsset(balance.currency);
                                    setActionModal('deposit');
                                  }}
                                >
                                  Deposit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAsset(balance.currency);
                                    setActionModal('withdraw');
                                  }}
                                >
                                  Withdraw
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Transactions Tab */
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Asset</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Time</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">TX Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <div className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium ${
                              tx.type === 'deposit'
                                ? 'bg-buy/10 text-buy'
                                : 'bg-sell/10 text-sell'
                            }`}>
                              {tx.type === 'deposit' ? (
                                <ArrowDownLeft className="h-3 w-3" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3" />
                              )}
                              {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                            </div>
                          </td>
                          <td className="px-4 py-4 font-medium">{tx.currency}</td>
                          <td className="px-4 py-4 text-right font-mono">{tx.amount}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              tx.status === 'completed'
                                ? 'bg-buy/10 text-buy'
                                : tx.status === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-500'
                                : 'bg-sell/10 text-sell'
                            }`}>
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {tx.timestamp.toLocaleString()}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <code className="text-sm text-muted-foreground">{tx.txHash}</code>
                              <button className="text-muted-foreground hover:text-foreground">
                                <Copy className="h-4 w-4" />
                              </button>
                              <button className="text-muted-foreground hover:text-foreground">
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deposit/Withdraw Modal */}
          {actionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {actionModal === 'deposit' ? (
                      <>
                        <ArrowDownLeft className="h-5 w-5 text-buy" />
                        Deposit {selectedAsset || 'Crypto'}
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="h-5 w-5 text-sell" />
                        Withdraw {selectedAsset || 'Crypto'}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {actionModal === 'deposit' ? (
                    <>
                      <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <p className="mb-2 text-sm text-muted-foreground">
                          Your {selectedAsset || 'BTC'} Deposit Address
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-sm break-all">
                            bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                          </code>
                          <Button variant="ghost" size="icon">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <div className="rounded-lg border border-border bg-white p-4">
                          <QrCode className="h-32 w-32 text-black" />
                        </div>
                      </div>
                      <p className="text-center text-sm text-muted-foreground">
                        Only send {selectedAsset || 'BTC'} to this address. Sending other assets may result in permanent loss.
                      </p>
                    </>
                  ) : (
                    <>
                      <Input
                        label="Withdrawal Address"
                        placeholder="Enter destination address"
                      />
                      <Input
                        label="Amount"
                        placeholder="0.00"
                        suffix={selectedAsset || 'BTC'}
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Available:</span>
                        <span>0.5234 {selectedAsset || 'BTC'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Network Fee:</span>
                        <span>0.0001 {selectedAsset || 'BTC'}</span>
                      </div>
                      <Button variant="sell" className="w-full">
                        Withdraw
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setActionModal(null);
                      setSelectedAsset(null);
                    }}
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
