import { authenticator } from 'otplib';

export interface TwoFactorSetup {
  secret: string;
  otpAuthUrl: string;
}

export function generateTwoFactorSecret(email: string): TwoFactorSetup {
  const secret = authenticator.generateSecret();
  const otpAuthUrl = authenticator.keyuri(email, 'Fry Exchange', secret);

  return { secret, otpAuthUrl };
}

export function verifyTwoFactorCode(secret: string, code: string): boolean {
  return authenticator.verify({ token: code, secret });
}
