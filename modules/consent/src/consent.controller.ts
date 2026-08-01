import {
  Controller, Post, Get, Body, Param, Query, Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ConsentService } from './consent.service';
import { CreateConsentDto, RevokeConsentDto, VerifyConsentDto } from './dto/consent.dto';
import { TenantId, CurrentUser, Roles, JwtPayload } from '@axiovital/common';

@ApiTags('Consent Management & Data Privacy (HIPAA / GDPR / ABDM)')
@Controller('consent')
@ApiBearerAuth('access-token')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post('grants')
  @Roles('DOCTOR', 'PATIENT', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Grant formal patient data access consent' })
  async grantConsent(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateConsentDto,
  ) {
    return this.consentService.grantConsent(tenantId, dto, user.sub);
  }

  @Patch('grants/:id/revoke')
  @Roles('DOCTOR', 'PATIENT', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Revoke active patient data access consent' })
  @ApiParam({ name: 'id', description: 'PatientConsent UUID' })
  async revokeConsent(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: RevokeConsentDto,
  ) {
    return this.consentService.revokeConsent(tenantId, id, dto, user.sub);
  }

  @Post('verify')
  @Roles('DOCTOR', 'NURSE', 'AUDITOR', 'TENANT_ADMIN', 'SYSTEM')
  @ApiOperation({ summary: 'Verify if active consent exists for user to access patient records' })
  async verifyConsent(
    @TenantId() tenantId: string,
    @Body() dto: VerifyConsentDto,
  ) {
    return this.consentService.verifyConsent(tenantId, dto);
  }

  @Get('patient/:patientId')
  @Roles('DOCTOR', 'NURSE', 'AUDITOR', 'PATIENT', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'List all active and historical consent grants for a patient' })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  async listPatientConsents(
    @TenantId() tenantId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.consentService.listPatientConsents(tenantId, patientId);
  }
}
