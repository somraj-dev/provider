import {
  Injectable, Logger, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import {
  CreateAppointmentDto, UpdateAppointmentStatusDto, RescheduleAppointmentDto,
} from './dto/appointment.dto';
import { AppointmentStatus, AuditAction, HoldStatus } from '@prisma/client';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: check if a doctor has an overlapping appointment.
   */
  private async checkDoctorConflict(
    tx: any,
    doctorId: string,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    const overlapping = await tx.appointment.findFirst({
      where: {
        doctorId,
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
        OR: [
          { startTime: { lte: startTime }, endTime: { gt: startTime } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ],
      },
    });

    return !!overlapping;
  }

  async createAppointment(tenantId: string, dto: CreateAppointmentDto, actorId: string) {
    const start = new Date(dto.startTime);
    const end = new Date(start.getTime() + dto.durationMinutes * 60 * 1000);

    if (start < new Date()) {
      throw new BadRequestException('Appointment start time must be in the future');
    }

    return this.prisma.$transaction(async (tx) => {
      // Check patient
      const patient = await tx.patient.findFirst({
        where: { id: dto.patientId, tenantId },
      });
      if (!patient) {
        throw new NotFoundException(`Patient with ID ${dto.patientId} not found`);
      }

      // Check doctor
      const doctor = await tx.doctor.findFirst({
        where: { id: dto.doctorId, tenantId },
        include: { user: { select: { firstName: true, lastName: true } } },
      });
      if (!doctor) {
        throw new NotFoundException(`Doctor with ID ${dto.doctorId} not found`);
      }

      // Double-booking check
      const hasConflict = await this.checkDoctorConflict(tx, dto.doctorId, start, end);
      if (hasConflict) {
        throw new ConflictException(
          `Doctor Dr. ${doctor.user.lastName} is already booked during the selected time slot`,
        );
      }

      const appointment = await tx.appointment.create({
        data: {
          tenantId,
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          type: dto.type,
          startTime: start,
          endTime: end,
          durationMinutes: dto.durationMinutes,
          reason: dto.reason,
          telehealthLink: dto.telehealthLink,
          status: AppointmentStatus.SCHEDULED,
        },
        include: {
          patient: { select: { firstName: true, lastName: true, mrn: true, phone: true } },
          doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      });

      // Record status history
      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: appointment.id,
          fromStatus: null,
          toStatus: AppointmentStatus.SCHEDULED,
          reason: 'Initial booking scheduled',
          changedBy: actorId,
        },
      });

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: actorId,
          action: AuditAction.CREATE,
          resourceType: 'Appointment',
          resourceId: appointment.id,
          description: `Scheduled appointment for ${appointment.patient.firstName} ${appointment.patient.lastName} with Dr. ${appointment.doctor.user.lastName}`,
        },
      });

      // Create Outbox Event for real-time WebSocket broadcast
      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateType: 'Appointment',
          aggregateId: appointment.id,
          eventType: 'APPOINTMENT_CREATED',
          payload: {
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            status: appointment.status,
          },
        },
      });

      this.logger.log(`Appointment created: ${appointment.id} in tenant ${tenantId}`);
      return appointment;
    });
  }

  async getAppointmentById(tenantId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, mrn: true, phone: true, email: true, dateOfBirth: true },
        },
        doctor: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
        facility: { select: { name: true, code: true } },
        department: { select: { name: true, code: true } },
        appointmentTypeConfig: { select: { name: true, durationMinutes: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
    }

    return appointment;
  }

  async listAppointments(
    tenantId: string,
    doctorId?: string,
    patientId?: string,
    status?: AppointmentStatus,
    date?: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    let dateFilter = {};

    if (date) {
      const dayStart = new Date(date);
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setUTCHours(23, 59, 59, 999);

      dateFilter = {
        startTime: { gte: dayStart, lte: dayEnd },
      };
    }

    const whereClause = {
      tenantId,
      ...(doctorId ? { doctorId } : {}),
      ...(patientId ? { patientId } : {}),
      ...(status ? { status } : {}),
      ...dateFilter,
    };

    const [appointments, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: {
          patient: { select: { firstName: true, lastName: true, mrn: true } },
          doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      }),
      this.prisma.appointment.count({ where: whereClause }),
    ]);

    return {
      data: appointments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateStatus(
    tenantId: string,
    appointmentId: string,
    dto: UpdateAppointmentStatusDto,
    actorId: string,
  ) {
    const appointment = await this.getAppointmentById(tenantId, appointmentId);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: dto.status,
          cancellationReason: dto.cancellationReason || appointment.cancellationReason,
          notes: dto.notes ? `${appointment.notes || ''}\n${dto.notes}`.trim() : appointment.notes,
          version: { increment: 1 },
        },
      });

      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId,
          fromStatus: appointment.status,
          toStatus: dto.status,
          reason: dto.cancellationReason || dto.notes || `Status updated to ${dto.status}`,
          changedBy: actorId,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId: actorId,
          action: AuditAction.UPDATE,
          resourceType: 'Appointment',
          resourceId: appointmentId,
          description: `Updated status to ${dto.status}`,
        },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateType: 'Appointment',
          aggregateId: appointmentId,
          eventType: `APPOINTMENT_${dto.status}`,
          payload: { appointmentId, status: dto.status },
        },
      });

      return updated;
    });
  }

  async reschedule(
    tenantId: string,
    appointmentId: string,
    dto: RescheduleAppointmentDto,
    actorId: string,
  ) {
    const appointment = await this.getAppointmentById(tenantId, appointmentId);

    const start = new Date(dto.newStartTime);
    const end = new Date(start.getTime() + (dto.durationMinutes || appointment.durationMinutes) * 60 * 1000);

    if (start < new Date()) {
      throw new BadRequestException('Rescheduled time must be in the future');
    }

    return this.prisma.$transaction(async (tx) => {
      // Exclude current appointment from conflict check!
      const hasConflict = await this.checkDoctorConflict(tx, appointment.doctorId, start, end, appointmentId);
      if (hasConflict) {
        throw new ConflictException('Doctor has an overlapping appointment at the proposed new time slot');
      }

      const oldStart = appointment.startTime.toISOString();
      const oldEnd = appointment.endTime.toISOString();

      const rescheduled = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          startTime: start,
          endTime: end,
          durationMinutes: dto.durationMinutes || appointment.durationMinutes,
          status: AppointmentStatus.RESCHEDULED,
          notes: dto.reason ? `${appointment.notes || ''}\nRescheduled: ${dto.reason}`.trim() : appointment.notes,
          version: { increment: 1 },
        },
      });

      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId,
          fromStatus: appointment.status,
          toStatus: AppointmentStatus.RESCHEDULED,
          reason: dto.reason || 'Appointment rescheduled',
          changedBy: actorId,
          metadata: {
            oldStartTime: oldStart,
            oldEndTime: oldEnd,
            newStartTime: start.toISOString(),
            newEndTime: end.toISOString(),
          },
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId: actorId,
          action: AuditAction.UPDATE,
          resourceType: 'Appointment',
          resourceId: appointmentId,
          description: `Rescheduled appointment to ${start.toISOString()}`,
        },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateType: 'Appointment',
          aggregateId: appointmentId,
          eventType: 'APPOINTMENT_RESCHEDULED',
          payload: {
            appointmentId,
            doctorId: appointment.doctorId,
            oldStartTime: oldStart,
            newStartTime: start.toISOString(),
          },
        },
      });

      return rescheduled;
    });
  }

  async cancelAppointment(tenantId: string, appointmentId: string, reason: string, actorId: string) {
    return this.updateStatus(
      tenantId,
      appointmentId,
      { status: AppointmentStatus.CANCELLED, cancellationReason: reason },
      actorId,
    );
  }

  async checkInAppointment(tenantId: string, appointmentId: string, actorId: string) {
    return this.updateStatus(
      tenantId,
      appointmentId,
      { status: AppointmentStatus.CHECKED_IN },
      actorId,
    );
  }

  async getHistory(tenantId: string, appointmentId: string) {
    await this.getAppointmentById(tenantId, appointmentId);
    return this.prisma.appointmentStatusHistory.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
