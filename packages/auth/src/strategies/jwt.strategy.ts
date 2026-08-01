import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@axiovital/database';

interface JwtPayloadFromToken {
  sub: string;
  email: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  type: string;
}

/**
 * JwtStrategy validates incoming JWT access tokens via Passport.
 *
 * - Extracts the Bearer token from the Authorization header.
 * - Verifies signature and expiration.
 * - Checks that the user still exists and is active.
 * - Attaches the validated payload to the request object.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret')!,
    });
  }

  async validate(payload: JwtPayloadFromToken) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Verify user still exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, status: true, tenantId: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is inactive or deleted');
    }

    if (user.tenantId !== payload.tenantId) {
      throw new UnauthorizedException('Tenant mismatch');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      roles: payload.roles,
      permissions: payload.permissions,
      sessionId: payload.sessionId,
    };
  }
}
