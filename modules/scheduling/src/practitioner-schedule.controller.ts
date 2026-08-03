import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PractitionerScheduleService } from './practitioner-schedule.service';
import { CreateScheduleTemplateDto, CreatePractitionerLeaveDto } from './dto/scheduling.dto';
import { TenantId, CurrentUser, JwtPayload, Roles } from '@axiovital/common';

@ApiTags('Practitioner Schedules')
@Controller('practitioners')
@ApiBearerAuth('access-token')
@Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
export class PractitionerScheduleController {
  constructor(private readonly scheduleService: PractitionerScheduleService) {}

  @Get(':id/schedule')
  @ApiOperation({ summary: 'Get doctor schedule templates, rules, and leaves' })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  async getDoctorSchedule(
    @TenantId() tenantId: string,
    @Param('id') doctorId: string,
  ) {
    return this.scheduleService.getDoctorSchedule(tenantId, doctorId);
  }

  @Post('schedule-templates')
  @ApiOperation({ summary: 'Create a recurring schedule template for a doctor' })
  async createScheduleTemplate(
    @TenantId() tenantId: string,
    @Body() dto: CreateScheduleTemplateDto,
  ) {
    return this.scheduleService.createScheduleTemplate(tenantId, dto);
  }

  @Post('leaves')
  @ApiOperation({ summary: 'Add a leave for a doctor' })
  async addPractitionerLeave(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePractitionerLeaveDto,
  ) {
    return this.scheduleService.addPractitionerLeave(tenantId, dto, user.sub);
  }
}
