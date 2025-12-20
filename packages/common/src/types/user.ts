export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export enum KYCStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum UserRole {
  USER = 'USER',
  VIP = 'VIP',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  status: UserStatus;
  role: UserRole;
  kycStatus: KYCStatus;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  username: string;
  status: UserStatus;
  role: UserRole;
  kycStatus: KYCStatus;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  createdAt: Date;
}

export interface UserCreateInput {
  email: string;
  username: string;
  password: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyHash: string;
  permissions: ApiKeyPermission[];
  ipWhitelist: string[];
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export enum ApiKeyPermission {
  READ = 'READ',
  TRADE = 'TRADE',
  WITHDRAW = 'WITHDRAW',
}
