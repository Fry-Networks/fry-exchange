import { prisma, User, UserStatus } from '@fry-exchange/database';
import { AuthTokens, generateUserId } from '@fry-exchange/common';
import { hashPassword, verifyPassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getExpirationTime,
} from '../utils/jwt';
import { generateTwoFactorSecret, verifyTwoFactorCode } from '../utils/twoFactor';

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
  error?: string;
  requiresTwoFactor?: boolean;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (existingEmail) {
      return { success: false, error: 'Email already registered' };
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: input.username.toLowerCase() },
    });
    if (existingUsername) {
      return { success: false, error: 'Username already taken' };
    }

    // Hash password and create user
    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        id: generateUserId(),
        email: input.email.toLowerCase(),
        username: input.username.toLowerCase(),
        passwordHash,
        status: UserStatus.ACTIVE, // Could be PENDING if email verification required
      },
    });

    // Generate tokens
    const tokens = await this.createTokens(user);

    return { success: true, user, tokens };
  }

  /**
   * Login a user
   */
  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Verify password
    const validPassword = await verifyPassword(input.password, user.passwordHash);
    if (!validPassword) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Check user status
    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.BANNED) {
      return { success: false, error: 'Account is suspended' };
    }

    // Check 2FA
    if (user.twoFactorEnabled) {
      if (!input.twoFactorCode) {
        return { success: false, requiresTwoFactor: true };
      }

      if (!user.twoFactorSecret || !verifyTwoFactorCode(user.twoFactorSecret, input.twoFactorCode)) {
        return { success: false, error: 'Invalid 2FA code' };
      }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.createTokens(user);

    return { success: true, user, tokens };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const payload = verifyRefreshToken(refreshToken);

      // Check if token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        return { success: false, error: 'Invalid refresh token' };
      }

      // Delete old token and create new ones
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      const tokens = await this.createTokens(storedToken.user);

      return { success: true, user: storedToken.user, tokens };
    } catch {
      return { success: false, error: 'Invalid refresh token' };
    }
  }

  /**
   * Logout - invalidate refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  /**
   * Logout all sessions for a user
   */
  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Setup 2FA for a user
   */
  async setup2FA(userId: string): Promise<{ secret: string; otpAuthUrl: string }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const { secret, otpAuthUrl } = generateTwoFactorSecret(user.email);

    // Store secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return { secret, otpAuthUrl };
  }

  /**
   * Enable 2FA after verification
   */
  async enable2FA(userId: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      return false;
    }

    const valid = verifyTwoFactorCode(user.twoFactorSecret, code);
    if (!valid) {
      return false;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return true;
  }

  /**
   * Disable 2FA
   */
  async disable2FA(userId: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      return false;
    }

    const valid = verifyTwoFactorCode(user.twoFactorSecret, code);
    if (!valid) {
      return false;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    return true;
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return false;
    }

    const validPassword = await verifyPassword(currentPassword, user.passwordHash);
    if (!validPassword) {
      return false;
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Invalidate all refresh tokens
    await this.logoutAll(userId);

    return true;
  }

  private async createTokens(user: User): Promise<AuthTokens> {
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: getExpirationTime('7d'),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}

export const authService = new AuthService();
