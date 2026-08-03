import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { HoldService } from './hold.service';
import { CreateAppointmentHoldDto } from './dto/scheduling.dto';
import { TenantId, CurrentUser, JwtPayload, Roles } from '@axiovital/common';

@ApiTags('Appointment Holds')
@Controller('appointment-holds')
@ApiBearerAuth('access-token')
@Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
export class HoldController {
  constructor(private readonly holdService: HoldService) {}

  @Post()
  @ApiOperation({ summary: 'Create a temporary 5-minute appointment slot hold' })
  async createHold(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAppointmentHoldDto,
  ) {
    return this.holdService.createHold(tenantId, user.sub, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Release a temporary slot hold' })
  @ApiParam({ name: 'id', description: 'Hold UUID' })
  async releaseHold(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.holdService.releaseHold(tenantId, id, user.sub);
  }
}
