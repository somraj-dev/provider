import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { TenantId, Roles } from '@axiovital/common';

@ApiTags('Executive Analytics & Clinical BI Dashboards')
@Controller('analytics')
@ApiBearerAuth('access-token')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'AUDITOR')
  @ApiOperation({ summary: 'Get Executive Hospital Operations KPI Dashboard (Census, Bed Occupancy, Revenue, Diagnostics)' })
  async getHospitalOverview(@TenantId() tenantId: string) {
    return this.analyticsService.getHospitalOverview(tenantId);
  }

  @Get('emergency-triage')
  @Roles('TENANT_ADMIN', 'DOCTOR', 'NURSE', 'AUDITOR')
  @ApiOperation({ summary: 'Get Emergency Department Triage Level Breakdown' })
  async getEmergencyTriageMetrics(@TenantId() tenantId: string) {
    return this.analyticsService.getEmergencyTriageMetrics(tenantId);
  }
}
