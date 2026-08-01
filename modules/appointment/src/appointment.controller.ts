import {
  Controller, Post, Get, Body, Param, Query, Patch, Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import {
  CreateAppointmentDto, UpdateAppointmentStatusDto, RescheduleAppointmentDto,
} from './dto/appointment.dto';
import { TenantId, CurrentUser, Roles, JwtPayload } from '@axiovital/common';
import { AppointmentStatus } from '@prisma/client';

@ApiTags('Appointments')
@Controller('appointments')
@ApiBearerAuth('access-token')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @Roles('DOCTOR', 'NURSE', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Schedule a new appointment' })
  async createAppointment(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentService.createAppointment(tenantId, dto, user.sub);
  }

  @Get()
  @Roles('DOCTOR', 'NURSE', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'List and filter appointments' })
  @ApiQuery({ name: 'doctorId', required: false })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
  @ApiQuery({ name: 'date', required: false, description: 'YYYY-MM-DD format' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listAppointments(
    @TenantId() tenantId: string,
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('date') date?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.appointmentService.listAppointments(
      tenantId, doctorId, patientId, status, date, page || 1, limit || 20,
    );
  }

  @Get(':id')
  @Roles('DOCTOR', 'NURSE', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Get appointment details by ID' })
  @ApiParam({ name: 'id', description: 'Appointment UUID' })
  async getAppointmentById(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.appointmentService.getAppointmentById(tenantId, id);
  }

  @Patch(':id/status')
  @Roles('DOCTOR', 'NURSE', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Update appointment status (Confirm, Cancel, In-Progress, Complete, No-Show)' })
  @ApiParam({ name: 'id', description: 'Appointment UUID' })
  async updateStatus(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentService.updateStatus(tenantId, id, dto, user.sub);
  }

  @Put(':id/reschedule')
  @Roles('DOCTOR', 'NURSE', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Reschedule appointment to a new date/time' })
  @ApiParam({ name: 'id', description: 'Appointment UUID' })
  async reschedule(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.appointmentService.reschedule(tenantId, id, dto, user.sub);
  }
}
