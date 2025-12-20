import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(
  value: number | string,
  options?: {
    decimals?: number;
    prefix?: string;
    suffix?: string;
  }
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  const { decimals = 2, prefix = '', suffix = '' } = options || {};

  if (isNaN(num)) return '-';

  return `${prefix}${num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
}

export function formatPrice(value: number | string, decimals = 2): string {
  return formatNumber(value, { decimals, prefix: '$' });
}

export function formatPercent(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  const sign = num >= 0 ? '+' : '';
  return `${sign}${formatNumber(num, { decimals: 2, suffix: '%' })}`;
}

export function formatCrypto(value: number | string, symbol: string, decimals = 8): string {
  return `${formatNumber(value, { decimals })} ${symbol}`;
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
