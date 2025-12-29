'use client';

import * as React from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { cn } from '@/lib/utils';

interface TradingChartProps {
  symbol: string;
  className?: string;
}

// Generate mock candlestick data
function generateCandlestickData(basePrice: number, count: number = 100): CandlestickData<Time>[] {
  const data: CandlestickData<Time>[] = [];
  let currentPrice = basePrice;
  const now = Math.floor(Date.now() / 1000);
  const interval = 3600; // 1 hour

  for (let i = count; i > 0; i--) {
    const time = (now - i * interval) as Time;
    const volatility = currentPrice * 0.02; // 2% volatility
    const open = currentPrice;
    const close = open + (Math.random() - 0.5) * volatility * 2;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;

    data.push({
      time,
      open,
      high,
      low,
      close,
    });

    currentPrice = close;
  }

  return data;
}

// Generate mock volume data
function generateVolumeData(candleData: CandlestickData<Time>[]): { time: Time; value: number; color: string }[] {
  return candleData.map((candle) => ({
    time: candle.time,
    value: Math.random() * 1000000 + 500000,
    color: candle.close >= candle.open ? 'rgba(0, 200, 83, 0.5)' : 'rgba(255, 23, 68, 0.5)',
  }));
}

const baseprices: Record<string, number> = {
  BTC_USDT: 43250,
  ETH_USDT: 2280,
  SOL_USDT: 98.75,
  FRY_USDT: 0.10,
  ALGO_USDT: 0.19,
};

export function TradingChart({ symbol, className }: TradingChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const candlestickSeriesRef = React.useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = React.useRef<ISeriesApi<'Histogram'> | null>(null);
  const [timeframe, setTimeframe] = React.useState<'1H' | '4H' | '1D' | '1W'>('1H');
  const [chartType, setChartType] = React.useState<'candle' | 'line'>('candle');

  React.useEffect(() => {
    if (!containerRef.current) return;

    // Create chart
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#ff0000',
          width: 1,
          style: 2,
          labelBackgroundColor: '#ff0000',
        },
        horzLine: {
          color: '#ff0000',
          width: 1,
          style: 2,
          labelBackgroundColor: '#ff0000',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00C853',
      downColor: '#FF1744',
      borderUpColor: '#00C853',
      borderDownColor: '#FF1744',
      wickUpColor: '#00C853',
      wickDownColor: '#FF1744',
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // Generate and set data
    const basePrice = baseprices[symbol] || 100;
    const candleData = generateCandlestickData(basePrice);
    const volumeData = generateVolumeData(candleData);

    candlestickSeries.setData(candleData);
    volumeSeries.setData(volumeData);

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (candlestickSeriesRef.current) {
        const lastCandle = candleData[candleData.length - 1];
        const volatility = lastCandle.close * 0.001;
        const newClose = lastCandle.close + (Math.random() - 0.5) * volatility * 2;
        const updatedCandle: CandlestickData<Time> = {
          ...lastCandle,
          close: newClose,
          high: Math.max(lastCandle.high, newClose),
          low: Math.min(lastCandle.low, newClose),
        };
        candlestickSeriesRef.current.update(updatedCandle);
        candleData[candleData.length - 1] = updatedCandle;
      }
    }, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
      chart.remove();
    };
  }, [symbol]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Chart Controls */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          {['1H', '4H', '1D', '1W'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf as typeof timeframe)}
              className={cn(
                'px-2 py-1 text-xs font-medium rounded transition-colors',
                timeframe === tf
                  ? 'bg-fry-red-500 text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Chart Type */}
          <button
            onClick={() => setChartType('candle')}
            className={cn(
              'p-1.5 rounded transition-colors',
              chartType === 'candle'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Candlestick"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 4v16M9 8h-2v8h2M15 6v12M15 10h2v4h-2" />
            </svg>
          </button>
          <button
            onClick={() => setChartType('line')}
            className={cn(
              'p-1.5 rounded transition-colors',
              chartType === 'line'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Line"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12l5-5 4 4 9-9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div ref={containerRef} className="flex-1 min-h-0" />
    </div>
  );
}
