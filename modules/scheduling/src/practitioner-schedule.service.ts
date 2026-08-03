import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import { CreateScheduleTemplateDto, CreatePractitionerLeaveDto } from './dto/scheduling.dto';

@Injectable()
export class PractitionerScheduleService {
  private readonly logger = new Logger(PractitionerScheduleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDoctorSchedule(tenantId: string, doctorId: string) {
    const doctor = await this.prisma.doctor.findFirst({
      where: { id: doctorId, tenantId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        scheduleTemplates: {
          where: { isActive: true },
          include: { rules: true },
        },
        leaves: {
          orderBy: { startDate: 'desc' },
          take: 10,
        },
        scheduleOverrides: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor ${doctorId} not found`);
    }

    return doctor;
  }

  async createScheduleTemplate(tenantId: string, dto: CreateScheduleTemplateDto) {
    const template = await this.prisma.scheduleTemplate.create({
      data: {
        tenantId,
        doctorId: dto.doctorId,
        facilityId: dto.facilityId,
        departmentId: dto.departmentId,
        name: dto.name,
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
        slotGranularityMin: dto.slotGranularityMin || 15,
        rules: {
          create: dto.rules.map(r => ({
            dayOfWeek: r.dayOfWeek,
            startTime: r.startTime,
            endTime: r.endTime,
          })),
        },
      },
      include: { rules: true },
    });

    return template;
  }

  async addPractitionerLeave(tenantId: string, dto: CreatePractitionerLeaveDto, actorId: string) {
    const leave = await this.prisma.practitionerLeave.create({
      data: {
        tenantId,
        doctorId: dto.doctorId,
        leaveType: dto.leaveType,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        reason: dto.reason,
        status: 'APPROVED',
        approvedBy: actorId,
        approvedAt: new Date(),
      },
    });

    return leave;
  }
}
