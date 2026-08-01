import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import * as crypto from 'crypto';

/**
 * SessionService manages device sessions and refresh token lifecycle.
 *
 * - Creates sessions on login with device fingerprinting.
 * - Stores refresh token hashes (never the raw token).
 * - Supports forced session revocation for security incidents.
 * - Implements refresh token rotation with family-based replay detection.
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Hash a refresh token for secure storage.
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Create a new device session.
   */
  async createSession(params: {
    userId: string;
    ipAddress: string;
    userAgent?: string;
    deviceName?: string;
    expiresAt: Date;
  }): Promise<string> {
    const session = await this.prisma.session.create({
      data: {
        userId: params.userId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        deviceName: params.deviceName,
        expiresAt: params.expiresAt,
        isActive: true,
      },
    });
    this.logger.log(`Session created: ${session.id} for user: ${params.userId}`);
    return session.id;
  }

  /**
   * Store a refresh token hash linked to a session.
   */
  async storeRefreshToken(params: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        userId: params.userId,
        tokenHash: params.tokenHash,
        familyId: params.familyId,
        expiresAt: params.expiresAt,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  }

  /**
   * Find a valid (non-revoked, non-expired) refresh token by hash.
   */
  async findValidRefreshToken(tokenHash: string) {
    return this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  }

  /**
   * Rotate a refresh token: revoke the old one and mark it as replaced.
   */
  async rotateRefreshToken(oldTokenHash: string, newTokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: oldTokenHash },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        replacedBy: newTokenHash,
      },
    });
  }

  /**
   * Revoke all refresh tokens in a family (replay detection).
   * If a revoked token is reused, the entire family is compromised.
   */
  async revokeTokenFamily(familyId: string): Promise<void> {
    const count = await this.prisma.refreshToken.updateMany({
      where: { familyId, isRevoked: false },
      data: { isRevoked: true, revokedAt: new Date() },
    });
    this.logger.warn(
      `Token family ${familyId} revoked (${count.count} tokens) — possible token replay attack`,
    );
  }

  /**
   * Revoke all sessions and refresh tokens for a user (forced logout).
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.session.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true, revokedAt: new Date() },
      }),
    ]);
    this.logger.log(`All sessions revoked for user: ${userId}`);
  }

  /**
   * Get all active sessions for a user.
   */
  async getActiveSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        deviceName: true,
        userAgent: true,
        ipAddress: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });
  }

  /**
   * Revoke a specific session by ID.
   */
  async revokeSession(sessionId: string, userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { isActive: false },
    });
  }
}
