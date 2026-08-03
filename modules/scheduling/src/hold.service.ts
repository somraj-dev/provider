import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import { CreateAppointmentHoldDto } from './dto/scheduling.dto';
import { AppointmentStatus, HoldStatus } from '@prisma/client';

@Injectable()
export class HoldService {
  private readonly logger = new Logger(HoldService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createHold(tenantId: string, userId: string, dto: CreateAppointmentHoldDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    const now = new Date();

    if (start <= now) {
      throw new ConflictException('Cannot place hold on past time slot');
    }

    // Check conflict with existing appointments
    const apptConflict = await this.prisma.appointment.findFirst({
      where: {
        tenantId,
        doctorId: dto.doctorId,
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (apptConflict) {
      throw new ConflictException('Slot is already booked');
    }

    // Check conflict with existing active hold
    const holdConflict = await this.prisma.appointmentHold.findFirst({
      where: {
        tenantId,
        doctorId: dto.doctorId,
        status: HoldStatus.ACTIVE,
        expiresAt: { gt: now },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (holdConflict) {
      throw new ConflictException('Slot is currently held by another user');
    }

    // Load hold duration from policy (default 300s / 5 minutes)
    const policy = await this.prisma.schedulingPolicy.findFirst({ where: { tenantId } });
    const holdSec = policy?.holdDurationSeconds || 300;
    const expiresAt = new Date(now.getTime() + holdSec * 1000);

    const token = `HOLD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const hold = await this.prisma.appointmentHold.create({
      data: {
        tenantId,
        doctorId: dto.doctorId,
        startTime: start,
        endTime: end,
        heldBy: userId,
        status: HoldStatus.ACTIVE,
        expiresAt,
        token,
      },
    });

    this.logger.log(`Created slot hold ${hold.id} for doctor ${dto.doctorId} until ${expiresAt.toISOString()}`);
    return hold;
  }

  async releaseHold(tenantId: string, holdId: string, userId: string) {
    const hold = await this.prisma.appointmentHold.findFirst({
      where: { id: holdId, tenantId, heldBy: userId },
    });
    if (!hold) {
      throw new NotFoundException(`Hold ${holdId} not found`);
    }

    const updated = await this.prisma.appointmentHold.update({
      where: { id: holdId },
      data: { status: HoldStatus.RELEASED },
    });

    return updated;
  }
}
