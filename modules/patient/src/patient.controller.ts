import {
  Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import {
  CreatePatientDto, AddAllergyDto, RecordVitalDto, AddConditionDto,
} from './dto/patient.dto';
import { TenantId, CurrentUser, Roles, JwtPayload } from '@axiovital/common';

@ApiTags('Patients')
@Controller('patients')
@ApiBearerAuth('access-token')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @Roles('DOCTOR', 'NURSE', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Register a new patient record' })
  async createPatient(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePatientDto,
  ) {
    return this.patientService.createPatient(tenantId, dto, user.sub);
  }

  @Get()
  @Roles('DOCTOR', 'NURSE', 'RECEPTIONIST', 'BILLING_CLERK', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Search and list patients' })
  @ApiQuery({ name: 'q', required: false, description: 'Search term (MRN, name, phone, national ID)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchPatients(
    @TenantId() tenantId: string,
    @Query('q') query?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.patientService.searchPatients(tenantId, query, page || 1, limit || 20);
  }

  @Get(':id')
  @Roles('DOCTOR', 'NURSE', 'RECEPTIONIST', 'BILLING_CLERK', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Get detailed patient profile with allergies & vitals' })
  @ApiParam({ name: 'id', description: 'Patient UUID' })
  async getPatientById(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.patientService.getPatientById(tenantId, id);
  }

  @Post(':id/allergies')
  @Roles('DOCTOR', 'NURSE', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Record a new allergy for patient' })
  @ApiParam({ name: 'id', description: 'Patient UUID' })
  async addAllergy(
    @TenantId() tenantId: string,
    @Param('id') patientId: string,
    @Body() dto: AddAllergyDto,
  ) {
    return this.patientService.addAllergy(tenantId, patientId, dto);
  }

  @Post(':id/vitals')
  @Roles('DOCTOR', 'NURSE', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Record vital signs for patient' })
  @ApiParam({ name: 'id', description: 'Patient UUID' })
  async recordVitals(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') patientId: string,
    @Body() dto: RecordVitalDto,
  ) {
    return this.patientService.recordVitals(tenantId, patientId, dto, user.sub);
  }

  @Post(':id/conditions')
  @Roles('DOCTOR', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Record a diagnosed medical condition' })
  @ApiParam({ name: 'id', description: 'Patient UUID' })
  async addCondition(
    @TenantId() tenantId: string,
    @Param('id') patientId: string,
    @Body() dto: AddConditionDto,
  ) {
    return this.patientService.addCondition(tenantId, patientId, dto);
  }
}
