'use client';

import * as React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatPrice, formatNumber, formatPercent } from '@/lib/utils';
import {
  TrendingUp,
  Droplets,
  Lock,
  Unlock,
  Clock,
  Coins,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  Wallet,
  Gift,
  Star,
  Zap,
} from 'lucide-react';

// Mock pool data
const liquidityPools = [
  {
    id: 'btc-usdt',
    pair: 'BTC/USDT',
    token0: { symbol: 'BTC', icon: '₿' },
    token1: { symbol: 'USDT', icon: '₮' },
    tvl: 15000000,
    apr: 12.5,
    volume24h: 2500000,
    yourLiquidity: 5000,
    rewards: 125.50,
    isHot: true,
  },
  {
    id: 'eth-usdt',
    pair: 'ETH/USDT',
    token0: { symbol: 'ETH', icon: 'Ξ' },
    token1: { symbol: 'USDT', icon: '₮' },
    tvl: 8500000,
    apr: 15.2,
    volume24h: 1800000,
    yourLiquidity: 2500,
    rewards: 78.25,
    isHot: true,
  },
  {
    id: 'fry-usdt',
    pair: 'FRY/USDT',
    token0: { symbol: 'FRY', icon: '🍟' },
    token1: { symbol: 'USDT', icon: '₮' },
    tvl: 2000000,
    apr: 85.5,
    volume24h: 500000,
    yourLiquidity: 10000,
    rewards: 450.00,
    isHot: true,
    isNew: true,
  },
  {
    id: 'sol-usdt',
    pair: 'SOL/USDT',
    token0: { symbol: 'SOL', icon: '◎' },
    token1: { symbol: 'USDT', icon: '₮' },
    tvl: 5000000,
    apr: 18.3,
    volume24h: 950000,
    yourLiquidity: 0,
    rewards: 0,
  },
  {
    id: 'algo-usdt',
    pair: 'ALGO/USDT',
    token0: { symbol: 'ALGO', icon: 'Ⱥ' },
    token1: { symbol: 'USDT', icon: '₮' },
    tvl: 1500000,
    apr: 22.1,
    volume24h: 320000,
    yourLiquidity: 0,
    rewards: 0,
  },
];

// Mock staking data
const stakingOptions = [
  {
    id: 'fry-30',
    token: 'FRY',
    icon: '🍟',
    duration: 30,
    apr: 25,
    minStake: 1000,
    totalStaked: 50000000,
    yourStake: 25000,
    rewards: 156.25,
  },
  {
    id: 'fry-90',
    token: 'FRY',
    icon: '🍟',
    duration: 90,
    apr: 45,
    minStake: 1000,
    totalStaked: 30000000,
    yourStake: 0,
    rewards: 0,
  },
  {
    id: 'fry-180',
    token: 'FRY',
    icon: '🍟',
    duration: 180,
    apr: 75,
    minStake: 5000,
    totalStaked: 15000000,
    yourStake: 0,
    rewards: 0,
  },
  {
    id: 'fry-365',
    token: 'FRY',
    icon: '🍟',
    duration: 365,
    apr: 120,
    minStake: 10000,
    totalStaked: 8000000,
    yourStake: 0,
    rewards: 0,
  },
];

export default function EarnPage() {
  const [activeTab, setActiveTab] = React.useState<'pools' | 'staking'>('pools');
  const [expandedPool, setExpandedPool] = React.useState<string | null>(null);
  const [expandedStake, setExpandedStake] = React.useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = React.useState('');
  const [liquidityAmount, setLiquidityAmount] = React.useState('');

  const totalEarnings = liquidityPools.reduce((sum, p) => sum + p.rewards, 0) +
    stakingOptions.reduce((sum, s) => sum + s.rewards, 0);
  const totalStaked = stakingOptions.reduce((sum, s) => sum + s.yourStake, 0);
  const totalLiquidity = liquidityPools.reduce((sum, p) => sum + p.yourLiquidity, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Earn</h1>
            <p className="text-muted-foreground">Earn passive income with liquidity pools and staking</p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-fry-red-500/10 to-fry-red-600/10 border-fry-red-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <Gift className="h-5 w-5 text-fry-red-500" />
                </div>
                <p className="mt-2 text-2xl font-bold text-fry-red-500">
                  {formatPrice(totalEarnings)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Unclaimed rewards</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Your Liquidity</p>
                  <Droplets className="h-5 w-5 text-blue-500" />
                </div>
                <p className="mt-2 text-2xl font-bold">{formatPrice(totalLiquidity)}</p>
                <p className="mt-1 text-sm text-muted-foreground">Across all pools</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Staked FRY</p>
                  <Lock className="h-5 w-5 text-purple-500" />
                </div>
                <p className="mt-2 text-2xl font-bold">{formatNumber(totalStaked)} FRY</p>
                <p className="mt-1 text-sm text-muted-foreground">≈ {formatPrice(totalStaked * 0.1)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Avg. APR</p>
                  <TrendingUp className="h-5 w-5 text-buy" />
                </div>
                <p className="mt-2 text-2xl font-bold text-buy">45.5%</p>
                <p className="mt-1 text-sm text-muted-foreground">Weighted average</p>
              </CardContent>
            </Card>
          </div>

          {/* Claim All Button */}
          {totalEarnings > 0 && (
            <div className="mb-8 flex justify-end">
              <Button variant="fry" size="lg">
                <Gift className="mr-2 h-5 w-5" />
                Claim All Rewards ({formatPrice(totalEarnings)})
              </Button>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 flex gap-4 border-b border-border">
            <button
              className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'pools'
                  ? 'border-b-2 border-fry-red-500 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('pools')}
            >
              <Droplets className="h-4 w-4" />
              Liquidity Pools
            </button>
            <button
              className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'staking'
                  ? 'border-b-2 border-fry-red-500 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('staking')}
            >
              <Lock className="h-4 w-4" />
              Staking
            </button>
          </div>

          {activeTab === 'pools' ? (
            /* Liquidity Pools */
            <div className="space-y-4">
              {liquidityPools.map((pool) => (
                <Card key={pool.id} className="overflow-hidden">
                  <div
                    className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/50"
                    onClick={() => setExpandedPool(expandedPool === pool.id ? null : pool.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted border-2 border-card text-lg">
                          {pool.token0.icon}
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted border-2 border-card text-lg">
                          {pool.token1.icon}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{pool.pair}</span>
                          {pool.isHot && (
                            <span className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-500">
                              <Zap className="h-3 w-3" /> Hot
                            </span>
                          )}
                          {pool.isNew && (
                            <span className="rounded-full bg-fry-red-500/10 px-2 py-0.5 text-xs font-medium text-fry-red-500">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          TVL: {formatPrice(pool.tvl)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-buy">{pool.apr}%</p>
                        <p className="text-sm text-muted-foreground">APR</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="font-medium">{formatPrice(pool.volume24h)}</p>
                        <p className="text-sm text-muted-foreground">24h Volume</p>
                      </div>
                      {pool.yourLiquidity > 0 && (
                        <div className="text-right hidden md:block">
                          <p className="font-medium">{formatPrice(pool.yourLiquidity)}</p>
                          <p className="text-sm text-muted-foreground">Your Liquidity</p>
                        </div>
                      )}
                      {expandedPool === pool.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {expandedPool === pool.id && (
                    <CardContent className="border-t border-border bg-muted/30 pt-4">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Pool Info */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Pool Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Value Locked</span>
                              <span>{formatPrice(pool.tvl)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">24h Volume</span>
                              <span>{formatPrice(pool.volume24h)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Pool Fee</span>
                              <span>0.3%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Your Share</span>
                              <span>{pool.yourLiquidity > 0 ? ((pool.yourLiquidity / pool.tvl) * 100).toFixed(4) : '0'}%</span>
                            </div>
                          </div>

                          {pool.yourLiquidity > 0 && (
                            <div className="rounded-lg border border-border bg-background p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Pending Rewards</span>
                                <span className="font-medium text-fry-red-500">{formatPrice(pool.rewards)}</span>
                              </div>
                              <Button variant="fry" size="sm" className="mt-2 w-full">
                                Claim Rewards
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Add/Remove Liquidity */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Manage Liquidity</h4>
                          <Input
                            label={`Amount (${pool.token1.symbol})`}
                            placeholder="0.00"
                            value={liquidityAmount}
                            onChange={(e) => setLiquidityAmount(e.target.value)}
                            suffix={pool.token1.symbol}
                          />
                          <div className="flex gap-3">
                            <Button variant="buy" className="flex-1">
                              Add Liquidity
                            </Button>
                            {pool.yourLiquidity > 0 && (
                              <Button variant="sell" className="flex-1">
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            /* Staking */
            <div className="grid gap-4 md:grid-cols-2">
              {stakingOptions.map((stake) => (
                <Card key={stake.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fry-red-500/10 text-2xl">
                          {stake.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{stake.token} Staking</CardTitle>
                          <CardDescription>{stake.duration} Days Lock</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-buy">{stake.apr}%</p>
                        <p className="text-sm text-muted-foreground">APR</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Staked</p>
                        <p className="font-medium">{formatNumber(stake.totalStaked)} FRY</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Min. Stake</p>
                        <p className="font-medium">{formatNumber(stake.minStake)} FRY</p>
                      </div>
                      {stake.yourStake > 0 && (
                        <>
                          <div>
                            <p className="text-muted-foreground">Your Stake</p>
                            <p className="font-medium">{formatNumber(stake.yourStake)} FRY</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Pending Rewards</p>
                            <p className="font-medium text-fry-red-500">{formatPrice(stake.rewards)}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {expandedStake === stake.id ? (
                      <div className="space-y-3 border-t border-border pt-4">
                        <Input
                          placeholder="Amount to stake"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          suffix="FRY"
                        />
                        <div className="flex gap-2">
                          {[25, 50, 75, 100].map((percent) => (
                            <button
                              key={percent}
                              onClick={() => setStakeAmount(String(50000 * percent / 100))}
                              className="flex-1 rounded-lg bg-muted py-1 text-sm font-medium hover:bg-muted/80"
                            >
                              {percent}%
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          <Button variant="fry" className="flex-1">
                            <Lock className="mr-2 h-4 w-4" />
                            Stake
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setExpandedStake(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Button
                          variant="fry"
                          className="flex-1"
                          onClick={() => setExpandedStake(stake.id)}
                        >
                          Stake FRY
                        </Button>
                        {stake.yourStake > 0 && (
                          <>
                            <Button variant="outline" className="flex-1">
                              <Unlock className="mr-2 h-4 w-4" />
                              Unstake
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Gift className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info Section */}
          <Card className="mt-8 bg-muted/30">
            <CardContent className="flex items-start gap-4 pt-6">
              <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Liquidity Pools:</strong> Provide liquidity to earn trading fees and FRY rewards.
                  APR varies based on trading volume and total liquidity.
                </p>
                <p>
                  <strong>Staking:</strong> Lock your FRY tokens to earn additional rewards.
                  Longer lock periods offer higher APR but tokens cannot be withdrawn until the lock period ends.
                </p>
                <p>
                  <strong>Impermanent Loss:</strong> Providing liquidity carries the risk of impermanent loss.
                  Please understand the risks before participating.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
