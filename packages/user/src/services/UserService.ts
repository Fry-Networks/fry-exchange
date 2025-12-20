import { prisma, User, UserStatus, KYCStatus } from '@fry-exchange/database';

export interface UserUpdateInput {
  username?: string;
}

export class UserService {
  /**
   * Get user by ID
   */
  async getById(userId: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  /**
   * Get user by username
   */
  async getByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username: username.toLowerCase() } });
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, input: UserUpdateInput): Promise<User | null> {
    if (input.username) {
      // Check if username is taken
      const existing = await prisma.user.findUnique({
        where: { username: input.username.toLowerCase() },
      });
      if (existing && existing.id !== userId) {
        throw new Error('Username already taken');
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        username: input.username?.toLowerCase(),
      },
    });
  }

  /**
   * Update user status (admin only)
   */
  async updateStatus(userId: string, status: UserStatus): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  /**
   * Update KYC status (admin only)
   */
  async updateKYCStatus(userId: string, kycStatus: KYCStatus): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { kycStatus },
    });
  }

  /**
   * Verify email
   */
  async verifyEmail(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  /**
   * Get user count
   */
  async count(): Promise<number> {
    return prisma.user.count();
  }

  /**
   * List users with pagination (admin only)
   */
  async list(options: {
    limit?: number;
    offset?: number;
    status?: UserStatus;
  }): Promise<{ users: User[]; total: number }> {
    const where = options.status ? { status: options.status } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: options.limit || 50,
        skip: options.offset || 0,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }
}

export const userService = new UserService();
