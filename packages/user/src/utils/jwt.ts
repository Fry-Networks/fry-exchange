import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface JWTConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

const INSECURE_DEFAULT_SECRET = 'development-secret';
const INSECURE_DEFAULT_REFRESH_SECRET = 'development-refresh-secret';

let config: JWTConfig = {
  secret: process.env.JWT_SECRET || INSECURE_DEFAULT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET || INSECURE_DEFAULT_REFRESH_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

export function configureJWT(newConfig: Partial<JWTConfig>): void {
  config = { ...config, ...newConfig };
}

/** Refuses to sign/verify with the well-known open-source default secret. */
function assertSecretConfigured(secret: string, envVarName: string): void {
  if (secret === INSECURE_DEFAULT_SECRET || secret === INSECURE_DEFAULT_REFRESH_SECRET) {
    throw new Error(
      `${envVarName} is not configured — set it (or call configureJWT()) before issuing or verifying tokens`
    );
  }
}

export function generateAccessToken(payload: JWTPayload): string {
  assertSecretConfigured(config.secret, 'JWT_SECRET');
  return jwt.sign(payload, config.secret, {
    expiresIn: config.expiresIn,
  });
}

export function generateRefreshToken(payload: { userId: string }): string {
  assertSecretConfigured(config.refreshSecret, 'JWT_REFRESH_SECRET');
  return jwt.sign(payload, config.refreshSecret, {
    expiresIn: config.refreshExpiresIn,
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  assertSecretConfigured(config.secret, 'JWT_SECRET');
  return jwt.verify(token, config.secret) as JWTPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  assertSecretConfigured(config.refreshSecret, 'JWT_REFRESH_SECRET');
  return jwt.verify(token, config.refreshSecret) as { userId: string };
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

export function getExpirationTime(expiresIn: string): Date {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid expiration format: ${expiresIn}`);
  }

  const value = parseInt(match[1]!, 10);
  const unit = match[2];
  const now = new Date();

  switch (unit) {
    case 's':
      return new Date(now.getTime() + value * 1000);
    case 'm':
      return new Date(now.getTime() + value * 60 * 1000);
    case 'h':
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'd':
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    default:
      throw new Error(`Invalid time unit: ${unit}`);
  }
}
