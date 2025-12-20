import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email().max(255),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8).max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  twoFactorCode: z.string().length(6).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const enable2FASchema = z.object({
  code: z.string().length(6),
});

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.enum(['READ', 'TRADE', 'WITHDRAW'])),
  ipWhitelist: z.array(z.string().ip()).optional(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

export const withdrawalSchema = z.object({
  coinId: z.string().min(1),
  network: z.string().min(1),
  address: z.string().min(1),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  memo: z.string().optional(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
