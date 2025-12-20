'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo, FryNetworksLogo } from '@/components/brand/Logo';
import {
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Wallet,
  RefreshCcw,
  Users,
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'High-performance matching engine processes thousands of orders per second.',
  },
  {
    icon: Shield,
    title: 'Secure',
    description:
      'Industry-leading security with cold storage, 2FA, and advanced encryption.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Trading',
    description:
      'Professional charts, limit orders, market orders, and real-time data.',
  },
  {
    icon: Wallet,
    title: 'Multi-Chain',
    description:
      'Support for Solana, Ethereum, BSC, and many more blockchain networks.',
  },
  {
    icon: RefreshCcw,
    title: 'Native AMM',
    description:
      'Provide liquidity and earn fees with our integrated AMM pools.',
  },
  {
    icon: Users,
    title: 'Developer Friendly',
    description:
      'Free API access with WebSocket support for real-time market data.',
  },
];

const stats = [
  { value: '$10B+', label: 'Trading Volume' },
  { value: '100+', label: 'Trading Pairs' },
  { value: '1M+', label: 'Users' },
  { value: '99.9%', label: 'Uptime' },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-20 sm:py-32">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-fry-red-500/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Logo Animation */}
              <div className="mb-8 flex justify-center">
                <FryNetworksLogo size="xl" className="h-24 animate-pulse-glow" />
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Trade Crypto with{' '}
                <span className="text-gradient">Confidence</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                The next generation cryptocurrency exchange. Advanced trading
                features, lightning-fast execution, and institutional-grade
                security.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register">
                  <Button variant="fry" size="xl" className="w-full sm:w-auto">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/trade">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
                    Start Trading
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-fry-red-500">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need to trade
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Professional-grade tools and features for traders of all levels.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-fry-red-500/10">
                      <feature.icon className="h-6 w-6 text-fry-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to start trading?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Join millions of traders on Fry Exchange. Sign up today and get
              started in minutes.
            </p>
            <div className="mt-8">
              <Link href="/register">
                <Button variant="fry" size="xl">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
