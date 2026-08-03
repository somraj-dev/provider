import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { GetAvailabilityQueryDto } from './dto/scheduling.dto';
import { TenantId, Roles } from '@axiovital/common';
import { PrismaService } from '@axiovital/database';

@ApiTags('Scheduling')
@Controller('scheduling')
@ApiBearerAuth('access-token')
@Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
export class SchedulingController {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('availability')
  @ApiOperation({ summary: 'Calculate real doctor appointment availability slots' })
  async getAvailability(
    @TenantId() tenantId: string,
    @Query() query: GetAvailabilityQueryDto,
  ) {
    return this.availabilityService.getAvailability(tenantId, query);
  }

  @Get('appointment-types')
  @ApiOperation({ summary: 'List configured appointment types and durations' })
  async getAppointmentTypes(@TenantId() tenantId: string) {
    return this.prisma.appointmentTypeConfig.findMany({
      where: { tenantId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
