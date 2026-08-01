import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  tokenType: string;
}

/**
 * JwtTokenService generates and verifies JWT access and refresh tokens.
 *
 * - Access tokens: short-lived (default 1h), carry user roles + permissions.
 * - Refresh tokens: long-lived (default 7d), single-use with rotation.
 * - Token family ID enables refresh token replay detection.
 */
@Injectable()
export class JwtTokenService {
  private readonly logger = new Logger(JwtTokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokenPair(payload: AccessTokenPayload): Promise<TokenPair> {
    const accessExpiresIn = this.configService.get<number>('jwt.expiresIn', 3600);
    const refreshExpiresIn = this.configService.get<number>('jwt.refreshExpiresIn', 604800);
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret')!;

    const accessToken = await this.jwtService.signAsync(
      {
        sub: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
        roles: payload.roles,
        permissions: payload.permissions,
        sessionId: payload.sessionId,
        type: 'access',
      },
      { expiresIn: accessExpiresIn },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: payload.sub,
        tenantId: payload.tenantId,
        sessionId: payload.sessionId,
        familyId: uuidv4(),
        type: 'refresh',
      },
      { secret: refreshSecret, expiresIn: refreshExpiresIn },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      refreshExpiresIn,
      tokenType: 'Bearer',
    };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync<AccessTokenPayload>(token);
  }

  async verifyRefreshToken(token: string): Promise<Record<string, unknown>> {
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret')!;
    return this.jwtService.verifyAsync(token, { secret: refreshSecret });
  }

  decodeToken(token: string): Record<string, unknown> | null {
    return this.jwtService.decode(token) as Record<string, unknown> | null;
  }
}
