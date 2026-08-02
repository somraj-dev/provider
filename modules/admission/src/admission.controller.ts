import {
  Controller, Post, Get, Body, Param, Query, Patch, Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AdmissionService } from './admission.service';
import {
  CreateBedDto, AdmitPatientDto, DischargePatientDto, TransferBedDto, AdmitWorkflowDto,
} from './dto/admission.dto';
import { TenantId, CurrentUser, Roles, JwtPayload } from '@axiovital/common';
import { AdmissionStatus, BedStatus } from '@prisma/client';

@ApiTags('Admission & Inpatient')
@Controller('admissions')
@ApiBearerAuth('access-token')
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  // ---- BED ENDPOINTS ----

  @Post('beds')
  @Roles('TENANT_ADMIN', 'NURSE')
  @ApiOperation({ summary: 'Add a new bed to hospital inventory' })
  async createBed(@TenantId() tenantId: string, @Body() dto: CreateBedDto) {
    return this.admissionService.createBed(tenantId, dto);
  }

  @Get('beds')
  @Roles('DOCTOR', 'NURSE', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'List and filter hospital beds by ward or status' })
  @ApiQuery({ name: 'ward', required: false })
  @ApiQuery({ name: 'status', required: false, enum: BedStatus })
  async listBeds(
    @TenantId() tenantId: string,
    @Query('ward') ward?: string,
    @Query('status') status?: BedStatus,
  ) {
    return this.admissionService.listBeds(tenantId, ward, status);
  }

  @Post()
  @Roles('DOCTOR', 'NURSE', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Admit a patient to inpatient care' })
  async admitPatient(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: AdmitPatientDto,
  ) {
    return this.admissionService.admitPatient(tenantId, dto, user.sub);
  }

  @Post('admit-workflow')
  @Roles('DOCTOR', 'NURSE', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Complete admit patient workflow (creates/fetches patient, assigns bed, creates encounter and admission)' })
  async admitWorkflow(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: AdmitWorkflowDto,
  ) {
    return this.admissionService.admitWorkflow(tenantId, dto, user.sub);
  }

  @Get()
  @Roles('DOCTOR', 'NURSE', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'List current inpatient census / admissions' })
  @ApiQuery({ name: 'status', required: false, enum: AdmissionStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listAdmissions(
    @TenantId() tenantId: string,
    @Query('status') status?: AdmissionStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.admissionService.listAdmissions(tenantId, status, page || 1, limit || 20);
  }

  @Patch(':id/discharge')
  @Roles('DOCTOR', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Discharge an admitted patient & free assigned bed' })
  @ApiParam({ name: 'id', description: 'Admission UUID' })
  async dischargePatient(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: DischargePatientDto,
  ) {
    return this.admissionService.dischargePatient(tenantId, id, dto, user.sub);
  }

  @Put(':id/transfer')
  @Roles('DOCTOR', 'NURSE', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Transfer an admitted patient to a new bed/ward' })
  @ApiParam({ name: 'id', description: 'Admission UUID' })
  async transferBed(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: TransferBedDto,
  ) {
    return this.admissionService.transferBed(tenantId, id, dto, user.sub);
  }
}
