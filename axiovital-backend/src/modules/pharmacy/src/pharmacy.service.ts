import {
  Injectable, Logger, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import {
  CreateInventoryItemDto, UpdateStockDto, CreatePrescriptionDto,
} from './dto/pharmacy.dto';
import { PrescriptionStatus, AuditAction } from '@prisma/client';

@Injectable()
export class PharmacyService {
  private readonly logger = new Logger(PharmacyService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---- INVENTORY MANAGEMENT ----

  async createInventoryItem(tenantId: string, dto: CreateInventoryItemDto) {
    const existing = await this.prisma.inventoryItem.findUnique({
      where: { tenantId_sku: { tenantId, sku: dto.sku } },
    });
    if (existing) {
      throw new ConflictException(`Inventory SKU ${dto.sku} already exists in this tenant`);
    }

    return this.prisma.inventoryItem.create({
      data: {
        tenantId,
        sku: dto.sku,
        name: dto.name,
        category: dto.category,
        stockQuantity: dto.stockQuantity,
        reorderLevel: dto.reorderLevel,
        unitPrice: dto.unitPrice,
        unitOfMeasure: dto.unitOfMeasure,
      },
    });
  }

  async listInventory(tenantId: string, lowStockOnly = false, category?: string) {
    return this.prisma.inventoryItem.findMany({
      where: {
        tenantId,
        ...(category ? { category: { contains: category, mode: 'insensitive' } } : {}),
      },
      orderBy: [{ name: 'asc' }],
    });
  }

  async updateStock(tenantId: string, itemId: string, dto: UpdateStockDto, actorId: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: itemId, tenantId },
    });
    if (!item) throw new NotFoundException(`Inventory item ${itemId} not found`);

    const newQuantity = item.stockQuantity + dto.quantityAdjustment;
    if (newQuantity < 0) {
      throw new BadRequestException(`Insufficient stock for ${item.name}. Current stock: ${item.stockQuantity}`);
    }

    const updated = await this.prisma.inventoryItem.update({
      where: { id: itemId },
      data: { stockQuantity: newQuantity },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.UPDATE,
        resourceType: 'InventoryItem',
        resourceId: itemId,
        description: `Stock adjusted by ${dto.quantityAdjustment > 0 ? '+' : ''}${dto.quantityAdjustment} for ${item.name} (${dto.reason || 'Manual Adjustment'})`,
      },
    });

    return updated;
  }

  // ---- PRESCRIPTION WORKFLOW ----

  async createPrescription(tenantId: string, dto: CreatePrescriptionDto, actorId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });
    if (!patient) throw new NotFoundException(`Patient ${dto.patientId} not found`);

    const doctor = await this.prisma.doctor.findFirst({
      where: { id: dto.prescribingDoctorId, tenantId },
    });
    if (!doctor) throw new NotFoundException(`Doctor ${dto.prescribingDoctorId} not found`);

    // Verify all requested medication inventory items exist
    const itemIds = dto.items.map((i) => i.inventoryItemId);
    const inventoryItems = await this.prisma.inventoryItem.findMany({
      where: { id: { in: itemIds }, tenantId },
    });
    if (inventoryItems.length !== itemIds.length) {
      throw new BadRequestException('One or more invalid medication inventory IDs in prescription');
    }

    const prescription = await this.prisma.prescription.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        prescribingDoctorId: dto.prescribingDoctorId,
        notes: dto.notes,
        status: PrescriptionStatus.PENDING,
        items: {
          create: dto.items.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            dosage: item.dosage,
            frequency: item.frequency,
            durationDays: item.durationDays,
            quantityPrescribed: item.quantityPrescribed,
            instructions: item.instructions,
          })),
        },
      },
      include: {
        patient: { select: { firstName: true, lastName: true, mrn: true } },
        prescribingDoctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        items: { include: { inventoryItem: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.CREATE,
        resourceType: 'Prescription',
        resourceId: prescription.id,
        description: `Prescribed ${prescription.items.length} medications for patient ${patient.mrn}`,
      },
    });

    this.logger.log(`Prescription created: ${prescription.id} in tenant ${tenantId}`);
    return prescription;
  }

  async dispensePrescription(tenantId: string, prescriptionId: string, pharmacistUserId: string) {
    const prescription = await this.prisma.prescription.findFirst({
      where: { id: prescriptionId, tenantId },
      include: { items: { include: { inventoryItem: true } }, patient: true },
    });

    if (!prescription) throw new NotFoundException(`Prescription ${prescriptionId} not found`);
    if (prescription.status === PrescriptionStatus.DISPENSED) {
      throw new BadRequestException('Prescription has already been dispensed');
    }

    // Check inventory stock sufficiency for all items
    for (const item of prescription.items) {
      if (item.inventoryItem.stockQuantity < item.quantityPrescribed) {
        throw new BadRequestException(
          `Insufficient stock for ${item.inventoryItem.name}. Required: ${item.quantityPrescribed}, Available: ${item.inventoryItem.stockQuantity}`,
        );
      }
    }

    // Atomic transaction: deduct inventory stock & mark prescription DISPENSED
    const dispensed = await this.prisma.$transaction(async (tx) => {
      for (const item of prescription.items) {
        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: { stockQuantity: { decrement: item.quantityPrescribed } },
        });

        await tx.prescriptionItem.update({
          where: { id: item.id },
          data: { quantityDispensed: item.quantityPrescribed },
        });
      }

      return tx.prescription.update({
        where: { id: prescriptionId },
        data: {
          status: PrescriptionStatus.DISPENSED,
          dispensedAt: new Date(),
          dispensedByPharmacistId: pharmacistUserId,
        },
        include: {
          items: { include: { inventoryItem: true } },
          dispensedByPharmacist: { select: { firstName: true, lastName: true } },
        },
      });
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: pharmacistUserId,
        action: AuditAction.UPDATE,
        resourceType: 'Prescription',
        resourceId: prescriptionId,
        description: `Dispensed prescription for patient ${prescription.patient.mrn}`,
      },
    });

    this.logger.log(`Prescription dispensed: ${prescriptionId} by pharmacist ${pharmacistUserId}`);
    return dispensed;
  }

  async getPrescriptionById(tenantId: string, prescriptionId: string) {
    const prescription = await this.prisma.prescription.findFirst({
      where: { id: prescriptionId, tenantId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true, phone: true } },
        prescribingDoctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        dispensedByPharmacist: { select: { firstName: true, lastName: true } },
        items: { include: { inventoryItem: true } },
      },
    });

    if (!prescription) throw new NotFoundException(`Prescription ${prescriptionId} not found`);
    return prescription;
  }

  async listPrescriptions(
    tenantId: string,
    status?: PrescriptionStatus,
    patientId?: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const whereClause = {
      tenantId,
      ...(status ? { status } : {}),
      ...(patientId ? { patientId } : {}),
    };

    const [prescriptions, total] = await this.prisma.$transaction([
      this.prisma.prescription.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { prescribedAt: 'desc' },
        include: {
          patient: { select: { firstName: true, lastName: true, mrn: true } },
          prescribingDoctor: { include: { user: { select: { firstName: true, lastName: true } } } },
          items: { include: { inventoryItem: true } },
        },
      }),
      this.prisma.prescription.count({ where: whereClause }),
    ]);

    return {
      data: prescriptions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
