import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ClinicalAiEngineService } from './ai-engine.service';
import {
  DrugInteractionCheckDto, DifferentialDiagnosisDto, ClinicalRiskScoreDto, SummarizeChartDto,
} from './dto/ai.dto';
import { TenantId, CurrentUser, Roles, JwtPayload } from '@axiovital/common';

@ApiTags('Clinical AI & Decision Support')
@Controller('ai')
@ApiBearerAuth('access-token')
export class ClinicalAiController {
  constructor(private readonly aiEngineService: ClinicalAiEngineService) {}

  @Post('drug-interactions')
  @Roles('DOCTOR', 'PHARMACIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Analyze drug-drug and drug-allergy interactions' })
  async checkDrugInteractions(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: DrugInteractionCheckDto,
  ) {
    return this.aiEngineService.checkDrugInteractions(tenantId, dto, user.sub);
  }

  @Post('differential-diagnosis')
  @Roles('DOCTOR', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Generate AI differential diagnosis & recommended diagnostic workup' })
  async generateDifferentialDiagnosis(
    @TenantId() tenantId: string,
    @Body() dto: DifferentialDiagnosisDto,
  ) {
    return this.aiEngineService.generateDifferentialDiagnosis(tenantId, dto);
  }

  @Post('risk-score')
  @Roles('DOCTOR', 'NURSE', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Calculate NEWS2 early warning & qSOFA sepsis risk score' })
  async calculateClinicalRiskScore(
    @TenantId() tenantId: string,
    @Body() dto: ClinicalRiskScoreDto,
  ) {
    return this.aiEngineService.calculateClinicalRiskScore(tenantId, dto);
  }

  @Post('summarize-chart')
  @Roles('DOCTOR', 'NURSE', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Generate executive AI patient chart summary' })
  async summarizePatientChart(
    @TenantId() tenantId: string,
    @Body() dto: SummarizeChartDto,
  ) {
    return this.aiEngineService.summarizePatientChart(tenantId, dto);
  }
}
