import {
  Injectable, Logger, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import {
  CreateLabTestCatalogDto, CreateLabOrderDto, RecordLabResultDto, UpdateLabOrderStatusDto,
} from './dto/laboratory.dto';
import { LabOrderStatus, AuditAction } from '@prisma/client';

@Injectable()
export class LaboratoryService {
  private readonly logger = new Logger(LaboratoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---- TEST CATALOG MANAGEMENT ----

  async createCatalogItem(tenantId: string, dto: CreateLabTestCatalogDto) {
    const existing = await this.prisma.labTestCatalog.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Lab test code ${dto.code} already exists in this tenant catalog`);
    }

    return this.prisma.labTestCatalog.create({
      data: {
        tenantId,
        code: dto.code,
        name: dto.name,
        category: dto.category,
        referenceRange: dto.referenceRange,
        unit: dto.unit,
        price: dto.price,
      },
    });
  }

  async listCatalog(tenantId: string, category?: string) {
    return this.prisma.labTestCatalog.findMany({
      where: {
        tenantId,
        ...(category ? { category: { contains: category, mode: 'insensitive' } } : {}),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  // ---- LAB ORDERS ----

  async createLabOrder(tenantId: string, dto: CreateLabOrderDto, actorId: string) {
    // Check patient
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });
    if (!patient) throw new NotFoundException(`Patient ${dto.patientId} not found`);

    // Check doctor
    const doctor = await this.prisma.doctor.findFirst({
      where: { id: dto.orderingDoctorId, tenantId },
    });
    if (!doctor) throw new NotFoundException(`Doctor ${dto.orderingDoctorId} not found`);

    // Verify all requested test catalog items exist
    const catalogItems = await this.prisma.labTestCatalog.findMany({
      where: { id: { in: dto.testCatalogIds }, tenantId },
    });
    if (catalogItems.length !== dto.testCatalogIds.length) {
      throw new BadRequestException('One or more invalid lab test IDs in order');
    }

    const order = await this.prisma.labOrder.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        orderingDoctorId: dto.orderingDoctorId,
        priority: dto.priority,
        sampleType: dto.sampleType,
        notes: dto.notes,
        status: LabOrderStatus.ORDERED,
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
        resourceType: 'LabOrder',
        resourceId: order.id,
        description: `Created ${order.priority} lab order for patient ${patient.mrn} (${catalogItems.length} tests)`,
      },
    });

    this.logger.log(`Lab order created: ${order.id} in tenant ${tenantId}`);
    return order;
  }

  async markSampleCollected(tenantId: string, orderId: string, actorId: string) {
    const order = await this.prisma.labOrder.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw new NotFoundException(`Lab order ${orderId} not found`);

    const updated = await this.prisma.labOrder.update({
      where: { id: orderId },
      data: {
        status: LabOrderStatus.SAMPLE_COLLECTED,
        sampleCollectedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.UPDATE,
        resourceType: 'LabOrder',
        resourceId: orderId,
        description: `Marked sample collected for lab order ${orderId}`,
      },
    });

    return updated;
  }

  async recordResult(tenantId: string, dto: RecordLabResultDto, techUserId: string) {
    const order = await this.prisma.labOrder.findFirst({
      where: { id: dto.labOrderId, tenantId },
      include: { results: true },
    });
    if (!order) throw new NotFoundException(`Lab order ${dto.labOrderId} not found`);

    const testCatalog = await this.prisma.labTestCatalog.findFirst({
      where: { id: dto.labTestCatalogId, tenantId },
    });
    if (!testCatalog) throw new NotFoundException(`Lab test catalog item ${dto.labTestCatalogId} not found`);

    const result = await this.prisma.labResult.create({
      data: {
        labOrderId: dto.labOrderId,
        labTestCatalogId: dto.labTestCatalogId,
        performingTechId: techUserId,
        resultValue: dto.resultValue,
        unit: dto.unit || testCatalog.unit || undefined,
        referenceRange: dto.referenceRange || testCatalog.referenceRange || undefined,
        isAbnormal: dto.isAbnormal ?? false,
        notes: dto.notes,
      },
    });

    // Update order status to IN_ANALYSIS or COMPLETED
    await this.prisma.labOrder.update({
      where: { id: dto.labOrderId },
      data: { status: LabOrderStatus.COMPLETED },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: techUserId,
        action: AuditAction.CREATE,
        resourceType: 'LabResult',
        resourceId: result.id,
        description: `Recorded result for ${testCatalog.name}: ${dto.resultValue} (Abnormal: ${result.isAbnormal})`,
      },
    });

    this.logger.log(`Lab result recorded for order ${dto.labOrderId}: ${testCatalog.name}`);
    return result;
  }

  async getOrderById(tenantId: string, orderId: string) {
    const order = await this.prisma.labOrder.findFirst({
      where: { id: orderId, tenantId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true, phone: true } },
        orderingDoctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        results: {
          include: {
            testCatalog: true,
            performingTech: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!order) throw new NotFoundException(`Lab order ${orderId} not found`);
    return order;
  }

  async listOrders(tenantId: string, status?: LabOrderStatus, patientId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const whereClause = {
      tenantId,
      ...(status ? { status } : {}),
      ...(patientId ? { patientId } : {}),
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.labOrder.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }], // STAT orders listed first
        include: {
          patient: { select: { firstName: true, lastName: true, mrn: true } },
          orderingDoctor: { include: { user: { select: { firstName: true, lastName: true } } } },
          results: true,
        },
      }),
      this.prisma.labOrder.count({ where: whereClause }),
    ]);

    return {
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
