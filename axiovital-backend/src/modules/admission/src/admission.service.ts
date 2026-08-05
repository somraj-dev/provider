import {
  Injectable, Logger, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import {
  CreateBedDto, AdmitPatientDto, DischargePatientDto, TransferBedDto,
} from './dto/admission.dto';
import { AdmissionStatus, BedStatus, AuditAction } from '@prisma/client';

@Injectable()
export class AdmissionService {
  private readonly logger = new Logger(AdmissionService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---- BED MANAGEMENT ----

  async createBed(tenantId: string, dto: CreateBedDto) {
    const existing = await this.prisma.bed.findUnique({
      where: { tenantId_bedNumber: { tenantId, bedNumber: dto.bedNumber } },
    });
    if (existing) {
      throw new ConflictException(`Bed number ${dto.bedNumber} already exists in this tenant`);
    }

    return this.prisma.bed.create({
      data: {
        tenantId,
        bedNumber: dto.bedNumber,
        ward: dto.ward,
        type: dto.type,
        dailyRate: dto.dailyRate,
        status: BedStatus.AVAILABLE,
      },
    });
  }

  async listBeds(tenantId: string, ward?: string, status?: BedStatus) {
    return this.prisma.bed.findMany({
      where: {
        tenantId,
        ...(ward ? { ward: { contains: ward, mode: 'insensitive' } } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: [{ ward: 'asc' }, { bedNumber: 'asc' }],
    });
  }

  // ---- ADMISSION WORKFLOW ----

  async admitPatient(tenantId: string, dto: AdmitPatientDto, actorId: string) {
    // Check patient
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });
    if (!patient) throw new NotFoundException(`Patient ${dto.patientId} not found`);

    // Check if patient already has an active admission
    const activeAdmission = await this.prisma.admission.findFirst({
      where: { patientId: dto.patientId, status: AdmissionStatus.ADMITTED },
    });
    if (activeAdmission) {
      throw new ConflictException(`Patient ${patient.firstName} ${patient.lastName} is already admitted`);
    }

    // Check doctor
    const doctor = await this.prisma.doctor.findFirst({
      where: { id: dto.doctorId, tenantId },
    });
    if (!doctor) throw new NotFoundException(`Doctor ${dto.doctorId} not found`);

    // Check & occupy bed if specified
    if (dto.bedId) {
      const bed = await this.prisma.bed.findFirst({
        where: { id: dto.bedId, tenantId },
      });
      if (!bed) throw new NotFoundException(`Bed ${dto.bedId} not found`);
      if (bed.status !== BedStatus.AVAILABLE) {
        throw new ConflictException(`Bed ${bed.bedNumber} is not currently available`);
      }
    }

    // Execute in transaction: create admission + update bed status
    const admission = await this.prisma.$transaction(async (tx) => {
      if (dto.bedId) {
        await tx.bed.update({
          where: { id: dto.bedId },
          data: { status: BedStatus.OCCUPIED },
        });
      }

      return tx.admission.create({
        data: {
          tenantId,
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          bedId: dto.bedId,
          priority: dto.priority,
          admittingDiagnosis: dto.admittingDiagnosis,
          status: AdmissionStatus.ADMITTED,
        },
        include: {
          patient: { select: { firstName: true, lastName: true, mrn: true } },
          doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
          bed: true,
        },
      });
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.CREATE,
        resourceType: 'Admission',
        resourceId: admission.id,
        description: `Admitted patient ${admission.patient.mrn} to ${admission.bed?.bedNumber || 'No Bed'}`,
      },
    });

    this.logger.log(`Patient admitted: ${admission.id} in tenant ${tenantId}`);
    return admission;
  }

  async dischargePatient(
    tenantId: string,
    admissionId: string,
    dto: DischargePatientDto,
    actorId: string,
  ) {
    const admission = await this.prisma.admission.findFirst({
      where: { id: admissionId, tenantId },
      include: { bed: true, patient: true },
    });

    if (!admission) throw new NotFoundException(`Admission ${admissionId} not found`);
    if (admission.status !== AdmissionStatus.ADMITTED && admission.status !== AdmissionStatus.TRANSFERRED) {
      throw new BadRequestException('Patient is not currently admitted');
    }

    const dischargeStatus = (dto.dischargeType as AdmissionStatus) || AdmissionStatus.DISCHARGED;

    const discharged = await this.prisma.$transaction(async (tx) => {
      // Free the bed if assigned
      if (admission.bedId) {
        await tx.bed.update({
          where: { id: admission.bedId },
          data: { status: BedStatus.AVAILABLE },
        });
      }

      return tx.admission.update({
        where: { id: admissionId },
        data: {
          status: dischargeStatus,
          dischargeDate: new Date(),
          dischargeSummary: dto.dischargeSummary,
        },
      });
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.UPDATE,
        resourceType: 'Admission',
        resourceId: admissionId,
        description: `Discharged patient ${admission.patient.mrn} (${dischargeStatus})`,
      },
    });

    return discharged;
  }

  async transferBed(
    tenantId: string,
    admissionId: string,
    dto: TransferBedDto,
    actorId: string,
  ) {
    const admission = await this.prisma.admission.findFirst({
      where: { id: admissionId, tenantId },
    });
    if (!admission) throw new NotFoundException(`Admission ${admissionId} not found`);
    if (admission.status !== AdmissionStatus.ADMITTED) {
      throw new BadRequestException('Can only transfer active admissions');
    }

    const targetBed = await this.prisma.bed.findFirst({
      where: { id: dto.targetBedId, tenantId },
    });
    if (!targetBed) throw new NotFoundException(`Target bed ${dto.targetBedId} not found`);
    if (targetBed.status !== BedStatus.AVAILABLE) {
      throw new ConflictException(`Target bed ${targetBed.bedNumber} is not available`);
    }

    const transferred = await this.prisma.$transaction(async (tx) => {
      // Free old bed
      if (admission.bedId) {
        await tx.bed.update({
          where: { id: admission.bedId },
          data: { status: BedStatus.AVAILABLE },
        });
      }

      // Occupy target bed
      await tx.bed.update({
        where: { id: dto.targetBedId },
        data: { status: BedStatus.OCCUPIED },
      });

      return tx.admission.update({
        where: { id: admissionId },
        data: {
          bedId: dto.targetBedId,
          status: AdmissionStatus.TRANSFERRED,
        },
        include: { bed: true },
      });
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.UPDATE,
        resourceType: 'Admission',
        resourceId: admissionId,
        description: `Transferred patient admission to bed ${targetBed.bedNumber}`,
      },
    });

    return transferred;
  }

  async listAdmissions(tenantId: string, status?: AdmissionStatus, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const whereClause = {
      tenantId,
      ...(status ? { status } : { status: AdmissionStatus.ADMITTED }),
    };

    const [admissions, total] = await this.prisma.$transaction([
      this.prisma.admission.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { admissionDate: 'desc' },
        include: {
          patient: { select: { firstName: true, lastName: true, mrn: true, phone: true } },
          doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
          bed: true,
        },
      }),
      this.prisma.admission.count({ where: whereClause }),
    ]);

    return {
      data: admissions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
