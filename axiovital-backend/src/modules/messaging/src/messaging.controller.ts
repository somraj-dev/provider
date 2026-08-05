import {
  Controller, Post, Get, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from '../../notification/src/notification.service';
import { SendMessageDto } from '../../notification/src/dto/notification.dto';
import { TenantId, CurrentUser, Roles, JwtPayload } from '@axiovital/common';

@ApiTags('Clinical Messaging')
@Controller('messaging')
@ApiBearerAuth('access-token')
export class MessagingController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('messages')
  @Roles('DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PHARMACIST', 'RADIOLOGIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Send encrypted clinical message to another healthcare provider' })
  async sendMessage(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SendMessageDto,
  ) {
    return this.notificationService.sendMessage(tenantId, user.sub, dto);
  }

  @Get('conversations/:userId')
  @Roles('DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PHARMACIST', 'RADIOLOGIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Get clinical chat conversation history with another user' })
  @ApiParam({ name: 'userId', description: 'Chat partner User UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getConversation(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('userId') otherUserId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationService.getConversation(tenantId, user.sub, otherUserId, page || 1, limit || 50);
  }
}
