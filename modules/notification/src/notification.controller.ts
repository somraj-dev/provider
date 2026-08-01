import {
  Controller, Post, Get, Body, Param, Query, Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { SendNotificationDto, SendMessageDto } from './dto/notification.dto';
import { TenantId, CurrentUser, Roles, JwtPayload } from '@axiovital/common';

@ApiTags('Notifications & Alerts')
@Controller('notifications')
@ApiBearerAuth('access-token')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @Roles('DOCTOR', 'NURSE', 'TENANT_ADMIN', 'SYSTEM')
  @ApiOperation({ summary: 'Send in-app notification / alert to user' })
  async sendNotification(
    @TenantId() tenantId: string,
    @Body() dto: SendNotificationDto,
  ) {
    return this.notificationService.sendNotification(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user notifications with unread count' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserNotifications(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Query('unreadOnly') unreadOnly?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationService.getUserNotifications(
      tenantId, user.sub, unreadOnly ?? false, page || 1, limit || 20,
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  async markAsRead(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.notificationService.markAsRead(tenantId, id, user.sub);
  }
}
