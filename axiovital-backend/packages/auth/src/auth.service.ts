import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import { PasswordService } from './services/password.service';
import { JwtTokenService, TokenPair, AccessTokenPayload } from './services/jwt-token.service';
import { SessionService } from './services/session.service';
import { RegisterDto, LoginDto, ChangePasswordDto, CreateTenantDto } from './dto';
import { TenantType, UserStatus, AuditAction } from '@prisma/client';

/**
 * AuthService orchestrates authentication, registration,
 * token management, and tenant provisioning.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 30;

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly sessionService: SessionService,
  ) {}

  // ---- REGISTRATION ----

  async register(
    tenantId: string,
    dto: RegisterDto,
    ipAddress: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    // Check if email is already registered within tenant
    const existingUser = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered in this organization');
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(dto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        status: UserStatus.ACTIVE,
        displayName: `${dto.firstName} ${dto.lastName}`,
      },
    });

    // Create default role assignment
    const defaultRole = await this.prisma.role.findFirst({
      where: { tenantId, systemRole: 'RECEPTIONIST' },
    });

    if (defaultRole) {
      await this.prisma.userRole2.create({
        data: { userId: user.id, roleId: defaultRole.id },
      });
    }

    // Create session and generate tokens
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const sessionId = await this.sessionService.createSession({
      userId: user.id,
      ipAddress,
      userAgent,
      expiresAt: sessionExpiresAt,
    });

    const userRoles = defaultRole ? [defaultRole.systemRole] : [];
    const tokenPair = await this.jwtTokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: userRoles,
      permissions: [],
      sessionId,
    });

    // Store refresh token hash
    const tokenHash = this.sessionService.hashToken(tokenPair.refreshToken);
    const decoded = this.jwtTokenService.decodeToken(tokenPair.refreshToken);
    await this.sessionService.storeRefreshToken({
      userId: user.id,
      tokenHash,
      familyId: (decoded?.familyId as string) || '',
      expiresAt: new Date(Date.now() + tokenPair.refreshExpiresIn * 1000),
      ipAddress,
      userAgent,
    });

    // Audit log
    await this.createAuditLog(tenantId, user.id, AuditAction.CREATE, 'User', user.id, 'User registered', ipAddress, userAgent);

    this.logger.log(`User registered: ${user.email} in tenant: ${tenantId}`);
    return tokenPair;
  }

  // ---- LOGIN ----

  async login(
    tenantId: string,
    dto: LoginDto,
    ipAddress: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
      include: {
        userRoles: { include: { role: { include: { permissions: true } } } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new ForbiddenException(
        `Account locked. Try again in ${minutesRemaining} minutes`,
      );
    }

    // Check account status
    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.INACTIVE) {
      throw new ForbiddenException('Account is suspended or inactive');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.verify(
      user.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      const attempts = user.failedLoginAttempts + 1;
      const updateData: Record<string, unknown> = { failedLoginAttempts: attempts };

      if (attempts >= this.MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(
          Date.now() + this.LOCKOUT_DURATION_MINUTES * 60 * 1000,
        );
        updateData.status = UserStatus.LOCKED;
      }

      await this.prisma.user.update({ where: { id: user.id }, data: updateData });
      await this.createAuditLog(tenantId, user.id, AuditAction.LOGIN_FAILED, 'User', user.id, `Failed login attempt ${attempts}`, ipAddress, userAgent);

      throw new UnauthorizedException('Invalid email or password');
    }

    // Reset failed attempts on successful login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        status: user.status === UserStatus.LOCKED ? UserStatus.ACTIVE : user.status,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Build roles and permissions
    const roles = user.userRoles.map((ur) => ur.role.systemRole);
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.permissions.map((p) => `${p.resource}:${p.action}`),
    );

    // Create session
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const sessionId = await this.sessionService.createSession({
      userId: user.id,
      ipAddress,
      userAgent,
      expiresAt: sessionExpiresAt,
    });

    // Generate tokens
    const tokenPair = await this.jwtTokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles,
      permissions,
      sessionId,
    });

    // Store refresh token
    const tokenHash = this.sessionService.hashToken(tokenPair.refreshToken);
    const decoded = this.jwtTokenService.decodeToken(tokenPair.refreshToken);
    await this.sessionService.storeRefreshToken({
      userId: user.id,
      tokenHash,
      familyId: (decoded?.familyId as string) || '',
      expiresAt: new Date(Date.now() + tokenPair.refreshExpiresIn * 1000),
      ipAddress,
      userAgent,
    });

    await this.createAuditLog(tenantId, user.id, AuditAction.LOGIN, 'User', user.id, 'User logged in', ipAddress, userAgent);

    this.logger.log(`User logged in: ${user.email}`);
    return tokenPair;
  }

  // ---- TOKEN REFRESH ----

  async refreshTokens(
    refreshToken: string,
    ipAddress: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    // Verify the refresh token signature
    let decoded: Record<string, unknown>;
    try {
      decoded = await this.jwtTokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.sessionService.hashToken(refreshToken);
    const storedToken = await this.sessionService.findValidRefreshToken(tokenHash);

    if (!storedToken) {
      // Token reuse detected — revoke entire family
      if (decoded.familyId) {
        await this.sessionService.revokeTokenFamily(decoded.familyId as string);
      }
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Load user with roles
    const user = await this.prisma.user.findUnique({
      where: { id: storedToken.userId },
      include: {
        userRoles: { include: { role: { include: { permissions: true } } } },
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    // Generate new token pair
    const roles = user.userRoles.map((ur) => ur.role.systemRole);
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.permissions.map((p) => `${p.resource}:${p.action}`),
    );

    const newTokenPair = await this.jwtTokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles,
      permissions,
      sessionId: (decoded.sessionId as string) || '',
    });

    // Rotate: revoke old token, store new one
    const newTokenHash = this.sessionService.hashToken(newTokenPair.refreshToken);
    await this.sessionService.rotateRefreshToken(tokenHash, newTokenHash);

    const newDecoded = this.jwtTokenService.decodeToken(newTokenPair.refreshToken);
    await this.sessionService.storeRefreshToken({
      userId: user.id,
      tokenHash: newTokenHash,
      familyId: (newDecoded?.familyId as string) || storedToken.familyId,
      expiresAt: new Date(Date.now() + newTokenPair.refreshExpiresIn * 1000),
      ipAddress,
      userAgent,
    });

    await this.createAuditLog(user.tenantId, user.id, AuditAction.TOKEN_REFRESH, 'RefreshToken', storedToken.id, 'Token refreshed', ipAddress, userAgent);

    return newTokenPair;
  }

  // ---- LOGOUT ----

  async logout(userId: string, sessionId: string, tenantId: string, ipAddress: string, userAgent?: string): Promise<void> {
    await this.sessionService.revokeSession(sessionId, userId);
    await this.createAuditLog(tenantId, userId, AuditAction.LOGOUT, 'Session', sessionId, 'User logged out', ipAddress, userAgent);
    this.logger.log(`User logged out: ${userId}, session: ${sessionId}`);
  }

  async logoutAll(userId: string, tenantId: string, ipAddress: string, userAgent?: string): Promise<void> {
    await this.sessionService.revokeAllUserSessions(userId);
    await this.createAuditLog(tenantId, userId, AuditAction.SESSION_REVOKED, 'User', userId, 'All sessions revoked', ipAddress, userAgent);
  }

  // ---- CHANGE PASSWORD ----

  async changePassword(
    userId: string,
    tenantId: string,
    dto: ChangePasswordDto,
    ipAddress: string,
    userAgent?: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isCurrentValid = await this.passwordService.verify(
      user.passwordHash,
      dto.currentPassword,
    );
    if (!isCurrentValid) throw new UnauthorizedException('Current password is incorrect');

    const newHash = await this.passwordService.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash, passwordChangedAt: new Date() },
    });

    // Revoke all sessions to force re-authentication
    await this.sessionService.revokeAllUserSessions(userId);

    await this.createAuditLog(tenantId, userId, AuditAction.PASSWORD_CHANGED, 'User', userId, 'Password changed', ipAddress, userAgent);
    this.logger.log(`Password changed for user: ${userId}`);
  }

  // ---- GET PROFILE ----

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        displayName: true, phone: true, avatarUrl: true,
        status: true, mfaEnabled: true, lastLoginAt: true,
        createdAt: true, tenantId: true,
        userRoles: { include: { role: { select: { name: true, systemRole: true } } } },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ---- TENANT PROVISIONING ----

  async createTenant(dto: CreateTenantDto, creatorUserId?: string, ipAddress?: string, userAgent?: string) {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existingTenant) throw new ConflictException('Tenant slug already exists');

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        type: dto.type as TenantType,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country || 'IN',
        status: 'ACTIVE',
      },
    });

    // Create default roles for the tenant
    const defaultRoles = [
      { name: 'Administrator', systemRole: 'TENANT_ADMIN' as const, description: 'Full administrative access' },
      { name: 'Doctor', systemRole: 'DOCTOR' as const, description: 'Medical practitioner access' },
      { name: 'Nurse', systemRole: 'NURSE' as const, description: 'Nursing staff access' },
      { name: 'Receptionist', systemRole: 'RECEPTIONIST' as const, description: 'Front desk access' },
      { name: 'Lab Technician', systemRole: 'LAB_TECHNICIAN' as const, description: 'Laboratory access' },
      { name: 'Pharmacist', systemRole: 'PHARMACIST' as const, description: 'Pharmacy access' },
      { name: 'Billing Clerk', systemRole: 'BILLING_CLERK' as const, description: 'Billing and finance access' },
      { name: 'Auditor', systemRole: 'AUDITOR' as const, description: 'Read-only audit access' },
    ];

    for (const role of defaultRoles) {
      await this.prisma.role.create({
        data: { tenantId: tenant.id, ...role },
      });
    }

    if (creatorUserId) {
      await this.createAuditLog(tenant.id, creatorUserId, AuditAction.CREATE, 'Tenant', tenant.id, `Tenant "${tenant.name}" created`, ipAddress, userAgent);
    }

    this.logger.log(`Tenant created: ${tenant.name} (${tenant.slug})`);
    return tenant;
  }

  // ---- LIST USERS (ADMIN) ----

  async listUsers(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          displayName: true, status: true, lastLoginAt: true, createdAt: true,
          userRoles: { include: { role: { select: { name: true, systemRole: true } } } },
        },
      }),
      this.prisma.user.count({ where: { tenantId } }),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ---- AUDIT LOG HELPER ----

  private async createAuditLog(
    tenantId: string, userId: string | null, action: AuditAction,
    resourceType: string, resourceId: string, description: string,
    ipAddress?: string | null, userAgent?: string | null,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        resourceType,
        resourceId,
        description,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  }
}
