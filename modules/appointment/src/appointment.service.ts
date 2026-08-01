import {
  Injectable, Logger, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import {
  CreateAppointmentDto, UpdateAppointmentStatusDto, RescheduleAppointmentDto,
} from './dto/appointment.dto';
import { AppointmentStatus, AuditAction } from '@prisma/client';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: check if a doctor has an overlapping appointment.
   */
  private async checkDoctorConflict(
    doctorId: string,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    const overlapping = await this.prisma.appointment.findFirst({
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
    // Check patient existence
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${dto.patientId} not found`);
    }

    // Check doctor existence
    const doctor = await this.prisma.doctor.findFirst({
      where: { id: dto.doctorId, tenantId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${dto.doctorId} not found`);
    }

    const start = new Date(dto.startTime);
    const end = new Date(start.getTime() + dto.durationMinutes * 60 * 1000);

    if (start < new Date()) {
      throw new BadRequestException('Appointment start time must be in the future');
    }

    // Double-booking check
    const hasConflict = await this.checkDoctorConflict(dto.doctorId, start, end);
    if (hasConflict) {
      throw new ConflictException(
        `Doctor Dr. ${doctor.user.lastName} is already booked during the selected time slot`,
      );
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        type: dto.type,
        startTime: start,
        endTime: end,
        reason: dto.reason,
        telehealthLink: dto.telehealthLink,
        status: AppointmentStatus.SCHEDULED,
      },
      include: {
        patient: { select: { firstName: true, lastName: true, mrn: true, phone: true } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.CREATE,
        resourceType: 'Appointment',
        resourceId: appointment.id,
        description: `Scheduled appointment for ${appointment.patient.firstName} ${appointment.patient.lastName} with Dr. ${appointment.doctor.user.lastName}`,
      },
    });

    this.logger.log(`Appointment created: ${appointment.id} in tenant ${tenantId}`);
    return appointment;
  }

  async getAppointmentById(tenantId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, mrn: true, phone: true, email: true },
        },
        doctor: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
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

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: dto.status,
        cancellationReason: dto.cancellationReason || appointment.cancellationReason,
        notes: dto.notes ? `${appointment.notes || ''}\n${dto.notes}`.trim() : appointment.notes,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.UPDATE,
        resourceType: 'Appointment',
        resourceId: appointmentId,
        description: `Updated status to ${dto.status}`,
      },
    });

    return updated;
  }

  async reschedule(
    tenantId: string,
    appointmentId: string,
    dto: RescheduleAppointmentDto,
    actorId: string,
  ) {
    const appointment = await this.getAppointmentById(tenantId, appointmentId);

    const start = new Date(dto.newStartTime);
    const end = new Date(start.getTime() + dto.durationMinutes * 60 * 1000);

    if (start < new Date()) {
      throw new BadRequestException('Rescheduled time must be in the future');
    }

    const hasConflict = await this.checkDoctorConflict(appointment.doctorId, start, end, appointmentId);
    if (hasConflict) {
      throw new ConflictException('Doctor has an overlapping appointment at the proposed new time');
    }

    const rescheduled = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        startTime: start,
        endTime: end,
        status: AppointmentStatus.RESCHEDULED,
        notes: dto.reason ? `${appointment.notes || ''}\nRescheduled: ${dto.reason}`.trim() : appointment.notes,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.UPDATE,
        resourceType: 'Appointment',
        resourceId: appointmentId,
        description: `Rescheduled appointment to ${start.toISOString()}`,
      },
    });

    return rescheduled;
  }
}
