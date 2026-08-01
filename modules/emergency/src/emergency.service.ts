import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import { CreateTriageDto } from './dto/emergency.dto';
import { AuditAction } from '@prisma/client';

@Injectable()
export class EmergencyService {
  private readonly logger = new Logger(EmergencyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createTriage(tenantId: string, dto: CreateTriageDto, triagedById: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });
    if (!patient) throw new NotFoundException(`Patient ${dto.patientId} not found`);

    const triage = await this.prisma.emergencyTriage.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        triagedById,
        triageLevel: dto.triageLevel,
        chiefComplaint: dto.chiefComplaint,
        vitalsSnapshot: dto.vitalsSnapshot || {},
      },
      include: {
        patient: { select: { firstName: true, lastName: true, mrn: true, dateOfBirth: true } },
        triagedBy: { select: { firstName: true, lastName: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: triagedById,
        action: AuditAction.CREATE,
        resourceType: 'EmergencyTriage',
        resourceId: triage.id,
        description: `Triaged patient ${patient.mrn} as Level ${triage.triageLevel}`,
      },
    });

    this.logger.log(`Emergency Triage created: Level ${triage.triageLevel} for patient ${patient.mrn}`);
    return triage;
  }

  async getTriageQueue(tenantId: string) {
    return this.prisma.emergencyTriage.findMany({
      where: { tenantId },
      orderBy: [
        { triageLevel: 'asc' },   // Priority 1 (Resuscitation) first
        { triagedAt: 'asc' },      // Oldest first within same priority level
      ],
      include: {
        patient: {
          select: {
            id: true, firstName: true, lastName: true, mrn: true,
            dateOfBirth: true, gender: true, bloodGroup: true,
          },
        },
        triagedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }
}
