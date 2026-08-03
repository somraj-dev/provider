import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import { CompleteAppointmentRequestDto, CreateAppointmentRequestDto } from './dto/scheduling.dto';
import { AppointmentRequestStatus } from '@prisma/client';

@Injectable()
export class AppointmentRequestService {
  private readonly logger = new Logger(AppointmentRequestService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createRequest(tenantId: string, dto: CreateAppointmentRequestDto, actorId: string) {
    const request = await this.prisma.appointmentRequest.create({
      data: {
        tenantId,
        appointmentId: dto.appointmentId,
        patientId: dto.patientId,
        requestType: dto.requestType,
        status: AppointmentRequestStatus.PENDING,
        priority: dto.priority || 'NORMAL',
        reason: dto.reason,
        notes: dto.reason,
        requestedBy: actorId,
        requestedNewStart: dto.requestedNewStart ? new Date(dto.requestedNewStart) : null,
      },
      include: {
        patient: { select: { firstName: true, lastName: true, mrn: true, phone: true } },
        appointment: {
          include: {
            doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
    });

    return request;
  }

  async listRequests(tenantId: string, status?: AppointmentRequestStatus) {
    const requests = await this.prisma.appointmentRequest.findMany({
      where: {
        tenantId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true, phone: true, email: true, dateOfBirth: true } },
        appointment: {
          include: {
            doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
            facility: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
      },
    });

    return requests;
  }

  async getRequestById(tenantId: string, id: string) {
    const request = await this.prisma.appointmentRequest.findFirst({
      where: { id, tenantId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true, phone: true, email: true, dateOfBirth: true } },
        appointment: {
          include: {
            doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
            facility: { select: { name: true } },
            department: { select: { name: true } },
            statusHistory: { orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Appointment request ${id} not found`);
    }

    return request;
  }

  async completeRequest(tenantId: string, id: string, dto: CompleteAppointmentRequestDto, actorId: string) {
    await this.getRequestById(tenantId, id);

    const updated = await this.prisma.appointmentRequest.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
        reviewedBy: actorId,
        reviewedAt: new Date(),
      },
    });

    return updated;
  }
}
