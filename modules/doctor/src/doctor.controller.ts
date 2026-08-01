import {
  Controller, Post, Get, Body, Param, Query, Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto, UpdateDoctorScheduleDto } from './dto/doctor.dto';
import { TenantId, CurrentUser, Roles, JwtPayload } from '@axiovital/common';
import { DoctorSpecialization } from '@prisma/client';

@ApiTags('Doctors')
@Controller('doctors')
@ApiBearerAuth('access-token')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Register a doctor profile for a user' })
  async createDoctor(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateDoctorDto,
  ) {
    return this.doctorService.createDoctor(tenantId, dto, user.sub);
  }

  @Get()
  @Roles('DOCTOR', 'NURSE', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'List and filter doctors' })
  @ApiQuery({ name: 'specialization', required: false, enum: DoctorSpecialization })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listDoctors(
    @TenantId() tenantId: string,
    @Query('specialization') specialization?: DoctorSpecialization,
    @Query('department') department?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.doctorService.listDoctors(tenantId, specialization, department, page || 1, limit || 20);
  }

  @Get(':id')
  @Roles('DOCTOR', 'NURSE', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Get doctor profile by ID' })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  async getDoctorById(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.doctorService.getDoctorById(tenantId, id);
  }

  @Put(':id/schedule')
  @Roles('DOCTOR', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Update doctor availability schedule' })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  async updateSchedule(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDoctorScheduleDto,
  ) {
    return this.doctorService.updateSchedule(tenantId, id, dto);
  }
}
