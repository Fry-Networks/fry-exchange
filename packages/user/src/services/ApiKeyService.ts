import { createHash, randomBytes } from 'crypto';
import { prisma, ApiKey } from '@fry-exchange/database';
import { generateApiKeyId, ApiKeyPermission } from '@fry-exchange/common';

export interface CreateApiKeyInput {
  userId: string;
  name: string;
  permissions: ApiKeyPermission[];
  ipWhitelist?: string[];
  expiresInDays?: number;
}

export interface ApiKeyWithSecret {
  apiKey: ApiKey;
  key: string; // Only returned once on creation
  secret: string; // Only returned once on creation
}

export class ApiKeyService {
  /**
   * Create a new API key
   */
  async create(input: CreateApiKeyInput): Promise<ApiKeyWithSecret> {
    // Generate key and secret
    const key = randomBytes(16).toString('hex');
    const secret = randomBytes(32).toString('base64url');

    // Hash the key for storage
    const keyHash = this.hashKey(key);

    const expiresAt = input.expiresInDays
      ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const apiKey = await prisma.apiKey.create({
      data: {
        id: generateApiKeyId(),
        userId: input.userId,
        name: input.name,
        keyHash,
        permissions: input.permissions,
        ipWhitelist: input.ipWhitelist || [],
        expiresAt,
      },
    });

    return {
      apiKey,
      key,
      secret,
    };
  }

  /**
   * Validate an API key
   */
  async validate(key: string): Promise<ApiKey | null> {
    const keyHash = this.hashKey(key);

    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
    });

    if (!apiKey) {
      return null;
    }

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    // Update last used
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return apiKey;
  }

  /**
   * Check if API key has permission
   */
  hasPermission(apiKey: ApiKey, permission: ApiKeyPermission): boolean {
    return apiKey.permissions.includes(permission);
  }

  /**
   * Check if request IP is whitelisted
   */
  isIpAllowed(apiKey: ApiKey, ip: string): boolean {
    if (apiKey.ipWhitelist.length === 0) {
      return true; // No whitelist means all IPs allowed
    }
    return apiKey.ipWhitelist.includes(ip);
  }

  /**
   * List API keys for a user
   */
  async listByUser(userId: string): Promise<ApiKey[]> {
    return prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete an API key
   */
  async delete(apiKeyId: string, userId: string): Promise<boolean> {
    const result = await prisma.apiKey.deleteMany({
      where: {
        id: apiKeyId,
        userId,
      },
    });

    return result.count > 0;
  }

  /**
   * Delete all API keys for a user
   */
  async deleteAllByUser(userId: string): Promise<number> {
    const result = await prisma.apiKey.deleteMany({
      where: { userId },
    });

    return result.count;
  }

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }
}

export const apiKeyService = new ApiKeyService();
