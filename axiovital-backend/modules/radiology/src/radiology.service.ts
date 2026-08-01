import {
  Injectable, Logger, NotFoundException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import {
  CreateImagingOrderDto, AttachImagingStudyDto, UpdateImagingStatusDto,
} from './dto/radiology.dto';
import { ImagingModality, ImagingOrderStatus, AuditAction } from '@prisma/client';

@Injectable()
export class RadiologyService {
  private readonly logger = new Logger(RadiologyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createImagingOrder(tenantId: string, dto: CreateImagingOrderDto, actorId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });
    if (!patient) throw new NotFoundException(`Patient ${dto.patientId} not found`);

    const doctor = await this.prisma.doctor.findFirst({
      where: { id: dto.orderingDoctorId, tenantId },
    });
    if (!doctor) throw new NotFoundException(`Doctor ${dto.orderingDoctorId} not found`);

    const order = await this.prisma.imagingOrder.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        orderingDoctorId: dto.orderingDoctorId,
        modality: dto.modality,
        bodyPart: dto.bodyPart,
        reason: dto.reason,
        isUrgent: dto.isUrgent ?? false,
        status: ImagingOrderStatus.REQUESTED,
      },
      include: {
        patient: { select: { firstName: true, lastName: true, mrn: true } },
        orderingDoctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.CREATE,
        resourceType: 'ImagingOrder',
        resourceId: order.id,
        description: `Requested ${order.modality} scan (${order.bodyPart}) for patient ${patient.mrn} (Urgent: ${order.isUrgent})`,
      },
    });

    this.logger.log(`Imaging order created: ${order.id} (${order.modality}) in tenant ${tenantId}`);
    return order;
  }

  async attachImagingStudy(tenantId: string, dto: AttachImagingStudyDto, actorId: string) {
    const order = await this.prisma.imagingOrder.findFirst({
      where: { id: dto.imagingOrderId, tenantId },
    });
    if (!order) throw new NotFoundException(`Imaging order ${dto.imagingOrderId} not found`);

    const existingUid = await this.prisma.imagingStudy.findUnique({
      where: { dicomStudyInstanceUid: dto.dicomStudyInstanceUid },
    });
    if (existingUid) {
      throw new ConflictException(`DICOM Study Instance UID ${dto.dicomStudyInstanceUid} is already registered`);
    }

    const study = await this.prisma.imagingStudy.create({
      data: {
        imagingOrderId: dto.imagingOrderId,
        dicomStudyInstanceUid: dto.dicomStudyInstanceUid,
        fileMetadataId: dto.fileMetadataId,
        performingRadiologistId: dto.performingRadiologistId,
        radiologyReport: dto.radiologyReport,
      },
    });

    // Mark order status as FINALIZED once report and DICOM study are attached
    await this.prisma.imagingOrder.update({
      where: { id: dto.imagingOrderId },
      data: { status: ImagingOrderStatus.FINALIZED },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.CREATE,
        resourceType: 'ImagingStudy',
        resourceId: study.id,
        description: `Attached DICOM study (${study.dicomStudyInstanceUid}) and report to imaging order ${dto.imagingOrderId}`,
      },
    });

    this.logger.log(`Imaging study attached to order ${dto.imagingOrderId}: UID ${dto.dicomStudyInstanceUid}`);
    return study;
  }

  async getImagingOrderById(tenantId: string, orderId: string) {
    const order = await this.prisma.imagingOrder.findFirst({
      where: { id: orderId, tenantId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true, phone: true } },
        orderingDoctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        imagingStudies: {
          include: {
            fileMetadata: true,
            performingRadiologist: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
    });

    if (!order) throw new NotFoundException(`Imaging order ${orderId} not found`);
    return order;
  }

  async listImagingOrders(
    tenantId: string,
    modality?: ImagingModality,
    status?: ImagingOrderStatus,
    patientId?: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const whereClause = {
      tenantId,
      ...(modality ? { modality } : {}),
      ...(status ? { status } : {}),
      ...(patientId ? { patientId } : {}),
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.imagingOrder.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [{ isUrgent: 'desc' }, { requestedAt: 'desc' }], // Urgent orders listed first
        include: {
          patient: { select: { firstName: true, lastName: true, mrn: true } },
          orderingDoctor: { include: { user: { select: { firstName: true, lastName: true } } } },
          imagingStudies: true,
        },
      }),
      this.prisma.imagingOrder.count({ where: whereClause }),
    ]);

    return {
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateStatus(tenantId: string, orderId: string, dto: UpdateImagingStatusDto, actorId: string) {
    const order = await this.getImagingOrderById(tenantId, orderId);

    const updated = await this.prisma.imagingOrder.update({
      where: { id: orderId },
      data: { status: dto.status },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.UPDATE,
        resourceType: 'ImagingOrder',
        resourceId: orderId,
        description: `Updated imaging order status to ${dto.status}`,
      },
    });

    return updated;
  }
}
