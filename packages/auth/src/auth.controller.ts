import {
  Controller, Post, Get, Body, Req, Param,
  HttpCode, HttpStatus, Query, Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ChangePasswordDto, CreateTenantDto } from './dto';
import { Public, CurrentUser, Roles, JwtPayload } from '@axiovital/common';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ---- PUBLIC ENDPOINTS ----

  @Public()
  @Post('register/:tenantId')
  @ApiOperation({ summary: 'Register a new user within a tenant' })
  @ApiParam({ name: 'tenantId', description: 'Tenant UUID' })
  async register(
    @Param('tenantId') tenantId: string,
    @Body() dto: RegisterDto,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '0.0.0.0';
    const userAgent = req.headers['user-agent'];
    return this.authService.register(tenantId, dto, ipAddress, userAgent);
  }

  @Public()
  @Post('login/:tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiParam({ name: 'tenantId', description: 'Tenant UUID' })
  async login(
    @Param('tenantId') tenantId: string,
    @Body() dto: LoginDto,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '0.0.0.0';
    const userAgent = req.headers['user-agent'];
    return this.authService.login(tenantId, dto, ipAddress, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refreshTokens(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '0.0.0.0';
    const userAgent = req.headers['user-agent'];
    return this.authService.refreshTokens(dto.refreshToken, ipAddress, userAgent);
  }

  // ---- PROTECTED ENDPOINTS ----

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout current session' })
  async logout(@CurrentUser() user: JwtPayload, @Req() req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '0.0.0.0';
    const userAgent = req.headers['user-agent'];
    await this.authService.logout(user.sub, user.sessionId || '', user.tenantId, ipAddress, userAgent);
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout from all devices' })
  async logoutAll(@CurrentUser() user: JwtPayload, @Req() req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '0.0.0.0';
    const userAgent = req.headers['user-agent'];
    await this.authService.logoutAll(user.sub, user.tenantId, ipAddress, userAgent);
    return { message: 'All sessions revoked' };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '0.0.0.0';
    const userAgent = req.headers['user-agent'];
    await this.authService.changePassword(user.sub, user.tenantId, dto, ipAddress, userAgent);
    return { message: 'Password changed. Please log in again.' };
  }

  @Get('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }

  @Get('sessions')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List active device sessions' })
  async getSessions(@CurrentUser() user: JwtPayload) {
    const sessionService = (this.authService as any).sessionService;
    return sessionService.getActiveSessions(user.sub);
  }

  @Delete('sessions/:sessionId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiParam({ name: 'sessionId', description: 'Session UUID to revoke' })
  async revokeSession(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId') sessionId: string,
  ) {
    const sessionService = (this.authService as any).sessionService;
    await sessionService.revokeSession(sessionId, user.sub);
    return { message: 'Session revoked' };
  }

  // ---- ADMIN ENDPOINTS ----

  @Post('tenants')
  @ApiBearerAuth('access-token')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new tenant (hospital/org)' })
  async createTenant(
    @Body() dto: CreateTenantDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '0.0.0.0';
    const userAgent = req.headers['user-agent'];
    return this.authService.createTenant(dto, user.sub, ipAddress, userAgent);
  }

  @Get('users')
  @ApiBearerAuth('access-token')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List users in current tenant' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listUsers(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.authService.listUsers(user.tenantId, page || 1, limit || 20);
  }
}
