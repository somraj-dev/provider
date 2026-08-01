import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Request } from 'express';

// ---- JWT Payload Interface ----
export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  roles: string[];
  permissions?: string[];
  sessionId?: string;
  iat?: number;
  exp?: number;
}

// ---- @CurrentUser() ----
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user?: JwtPayload }).user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);

// ---- @TenantId() ----
export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user?: JwtPayload }).user;
    return user?.tenantId;
  },
);

// ---- @Public() ----
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// ---- @Roles() ----
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// ---- @Permissions() ----
export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
