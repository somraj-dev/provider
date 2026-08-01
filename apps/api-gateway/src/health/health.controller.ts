import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '@axiovital/database';
import { Public } from '@axiovital/common';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  async liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe — checks database' })
  async readiness() {
    const services: Record<string, { status: string; latencyMs?: number }> = {};

    const dbStart = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      services['postgres'] = { status: 'healthy', latencyMs: Date.now() - dbStart };
    } catch {
      services['postgres'] = { status: 'unhealthy' };
    }

    const allHealthy = Object.values(services).every((s) => s.status === 'healthy');
    return { status: allHealthy ? 'ok' : 'degraded', timestamp: new Date().toISOString(), services };
  }
}
