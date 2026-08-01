import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmergencyService } from './emergency.service';
import { CreateTriageDto } from './dto/emergency.dto';
import { TenantId, CurrentUser, Roles, JwtPayload } from '@axiovital/common';

@ApiTags('Emergency & Triage')
@Controller('emergency')
@ApiBearerAuth('access-token')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post('triage')
  @Roles('DOCTOR', 'NURSE', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Perform emergency triage on incoming patient (ESI Level 1-5)' })
  async createTriage(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTriageDto,
  ) {
    return this.emergencyService.createTriage(tenantId, dto, user.sub);
  }

  @Get('queue')
  @Roles('DOCTOR', 'NURSE', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Get active Emergency Department priority queue (Level 1 immediate first)' })
  async getTriageQueue(@TenantId() tenantId: string) {
    return this.emergencyService.getTriageQueue(tenantId);
  }
}
