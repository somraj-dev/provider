import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AppointmentRequestService } from './appointment-request.service';
import { CreateAppointmentRequestDto, CompleteAppointmentRequestDto } from './dto/scheduling.dto';
import { TenantId, CurrentUser, JwtPayload, Roles } from '@axiovital/common';
import { AppointmentRequestStatus } from '@prisma/client';

@ApiTags('Appointment Requests')
@Controller('appointment-requests')
@ApiBearerAuth('access-token')
@Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
export class AppointmentRequestController {
  constructor(private readonly requestService: AppointmentRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an appointment reschedule/cancellation request' })
  async createRequest(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAppointmentRequestDto,
  ) {
    return this.requestService.createRequest(tenantId, dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List appointment reschedule/cancellation requests' })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentRequestStatus })
  async listRequests(
    @TenantId() tenantId: string,
    @Query('status') status?: AppointmentRequestStatus,
  ) {
    return this.requestService.listRequests(tenantId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of an appointment request' })
  @ApiParam({ name: 'id', description: 'Request UUID' })
  async getRequestById(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.requestService.getRequestById(tenantId, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete/approve/decline an appointment request' })
  @ApiParam({ name: 'id', description: 'Request UUID' })
  async completeRequest(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CompleteAppointmentRequestDto,
  ) {
    return this.requestService.completeRequest(tenantId, id, dto, user.sub);
  }
}
