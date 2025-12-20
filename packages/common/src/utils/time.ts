export function nowMs(): number {
  return Date.now();
}

export function nowDate(): Date {
  return new Date();
}

export function toTimestamp(date: Date): number {
  return date.getTime();
}

export function fromTimestamp(timestamp: number): Date {
  return new Date(timestamp);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function isExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return Date.now() > expiresAt.getTime();
}

export function formatISODate(date: Date): string {
  return date.toISOString();
}

// Get the start of a time bucket for kline aggregation
export function getKlineOpenTime(timestamp: number, intervalMs: number): number {
  return Math.floor(timestamp / intervalMs) * intervalMs;
}

export const INTERVAL_MS = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
} as const;
