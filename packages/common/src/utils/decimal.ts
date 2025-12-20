import Decimal from 'decimal.js';

// Configure Decimal.js for financial calculations
Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_DOWN,
  toExpNeg: -9,
  toExpPos: 21,
});

export { Decimal };

export function toDecimal(value: string | number | Decimal): Decimal {
  return new Decimal(value);
}

export function formatDecimal(value: Decimal, decimals: number): string {
  return value.toFixed(decimals);
}

export function isValidDecimal(value: string): boolean {
  try {
    new Decimal(value);
    return true;
  } catch {
    return false;
  }
}

export function compareDecimals(a: Decimal, b: Decimal): number {
  return a.comparedTo(b);
}

export function minDecimal(...values: Decimal[]): Decimal {
  return Decimal.min(...values);
}

export function maxDecimal(...values: Decimal[]): Decimal {
  return Decimal.max(...values);
}

export function sumDecimals(values: Decimal[]): Decimal {
  return values.reduce((acc, val) => acc.plus(val), new Decimal(0));
}

// Ensure value is within precision
export function truncateToStep(value: Decimal, step: Decimal): Decimal {
  return value.div(step).floor().mul(step);
}

// Ensure price is within tick size
export function truncateToTick(price: Decimal, tickSize: Decimal): Decimal {
  return price.div(tickSize).floor().mul(tickSize);
}
