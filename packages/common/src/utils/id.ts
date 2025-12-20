import { randomBytes } from 'crypto';

const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function generateId(prefix: string = '', length: number = 16): string {
  const bytes = randomBytes(length);
  let result = '';

  for (let i = 0; i < bytes.length; i++) {
    result += BASE62_ALPHABET[bytes[i]! % 62];
  }

  return prefix ? `${prefix}_${result}` : result;
}

export function generateOrderId(): string {
  return generateId('ord', 20);
}

export function generateTradeId(): string {
  return generateId('trd', 20);
}

export function generateUserId(): string {
  return generateId('usr', 16);
}

export function generateWalletId(): string {
  return generateId('wal', 16);
}

export function generateTransactionId(): string {
  return generateId('txn', 20);
}

export function generateApiKeyId(): string {
  return generateId('key', 16);
}

export function generateApiKey(): string {
  // 32 bytes = 256 bits of entropy
  return randomBytes(32).toString('hex');
}

export function generateApiSecret(): string {
  // 48 bytes = 384 bits of entropy
  return randomBytes(48).toString('base64url');
}
