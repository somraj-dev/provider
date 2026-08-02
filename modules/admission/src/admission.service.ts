import {
  Injectable, Logger, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import {
  CreateBedDto, AdmitPatientDto, DischargePatientDto, TransferBedDto,
} from './dto/admission.dto';
import { AdmissionStatus, BedStatus, AuditAction, AdmissionPriority } from '@prisma/client';

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

  // ---- FULL ADMIT PATIENT WORKFLOW ----

  async admitWorkflow(tenantId: string, dto: any, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      let patientId = dto.patientId;

      // 1. Create or fetch patient
      if (!patientId) {
        // Generate MRN atomically
        const prefix = 'MRN';
        const mrnResult = await tx.$queryRaw<Array<{ last_value: number }>>`
          INSERT INTO mrn_sequences (id, tenant_id, prefix, last_value, updated_at)
          VALUES (gen_random_uuid(), ${tenantId}::uuid, ${prefix}, 1, NOW())
          ON CONFLICT (tenant_id, prefix)
          DO UPDATE SET last_value = mrn_sequences.last_value + 1, updated_at = NOW()
          RETURNING last_value
        `;
        const sequence = String(mrnResult[0].last_value).padStart(7, '0');
        const mrn = `${prefix}-${sequence}`;

        const createdPatient = await tx.patient.create({
          data: {
            tenantId,
            mrn,
            title: dto.title,
            firstName: dto.firstName,
            middleName: dto.middleName,
            lastName: dto.lastName,
            dateOfBirth: new Date(dto.dateOfBirth),
            gender: (dto.gender as any) || 'MALE',
            bloodGroup: (dto.bloodGroup as any) || 'UNKNOWN',
            maritalStatus: (dto.maritalStatus as any) || 'SINGLE',
            nationality: dto.nationality,
            religion: dto.religion,
            language: dto.language,
            nationalId: dto.nationalId,
            email: dto.email,
            phone: dto.phone,
            alternateMobile: dto.alternateMobile,
            addressLine1: dto.addressLine1,
            addressLine2: dto.addressLine2,
            landmark: dto.landmark,
            city: dto.city,
            state: dto.state,
            country: dto.country || 'IN',
            postalCode: dto.postalCode,
          },
        });
        patientId = createdPatient.id;
      }

      const patient = await tx.patient.findFirst({
        where: { id: patientId, tenantId },
      });
      if (!patient) throw new NotFoundException(`Patient ${patientId} not found`);

      // 2. Resolve Doctor
      let doctorId = dto.doctorId;
      if (!doctorId) {
        const doctor = await tx.doctor.findFirst({
          where: { tenantId, status: 'ACTIVE' },
        });
        if (doctor) {
          doctorId = doctor.id;
        } else {
          throw new BadRequestException('No active doctor available for admission assignment');
        }
      }

      // 3. Resolve Bed
      let bedId = dto.bedId;
      if (bedId) {
        // Could be UUID or bedNumber
        const bedByNumber = await tx.bed.findFirst({
          where: { tenantId, OR: [{ id: bedId }, { bedNumber: bedId }] },
        });
        if (bedByNumber) {
          bedId = bedByNumber.id;
          await tx.bed.update({
            where: { id: bedId },
            data: { status: BedStatus.OCCUPIED },
          });
        } else {
          bedId = undefined;
        }
      }

      // 4. Create Admission
      const priorityMap: Record<string, AdmissionPriority> = {
        Emergency: AdmissionPriority.EMERGENCY,
        Routine: AdmissionPriority.ROUTINE,
        Transfer: AdmissionPriority.URGENT,
      };
      const priority = priorityMap[dto.admissionType] || AdmissionPriority.ROUTINE;

      const admission = await tx.admission.create({
        data: {
          tenantId,
          patientId: patient.id,
          doctorId,
          bedId,
          priority,
          admittingDiagnosis: dto.admittingDiagnosis || `${dto.admissionType || 'Inpatient'} admission to ${dto.department || 'General'}`,
          status: AdmissionStatus.ADMITTED,
        },
        include: {
          patient: true,
          doctor: { include: { user: true } },
          bed: true,
        },
      });

      // 5. Create Encounter
      const encPrefix = 'ENC';
      const encResult = await tx.$queryRaw<Array<{ last_value: number }>>`
        INSERT INTO mrn_sequences (id, tenant_id, prefix, last_value, updated_at)
        VALUES (gen_random_uuid(), ${tenantId}::uuid, ${encPrefix}, 1, NOW())
        ON CONFLICT (tenant_id, prefix)
        DO UPDATE SET last_value = mrn_sequences.last_value + 1, updated_at = NOW()
        RETURNING last_value
      `;
      const encSeq = String(encResult[0].last_value).padStart(7, '0');
      const encounterNumber = `${encPrefix}-${encSeq}`;

      await tx.encounter.create({
        data: {
          tenantId,
          patientId: patient.id,
          admissionId: admission.id,
          encounterNumber,
          type: (dto.visitType?.toUpperCase() as any) || 'INPATIENT',
          status: 'IN_PROGRESS',
          chiefComplaint: dto.admittingDiagnosis || 'Inpatient Admission',
          referredBy: dto.referredBy,
          referringDoctor: dto.referringDoctor,
        },
      });

      // 6. Record BedAssignment history
      if (bedId) {
        await tx.bedAssignment.create({
          data: {
            admissionId: admission.id,
            bedId,
            reason: 'Initial Admission',
          },
        });
      }

      // 7. Audit Log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: actorId,
          action: AuditAction.CREATE,
          resourceType: 'Admission',
          resourceId: admission.id,
          description: `Workflow Admitted ${patient.firstName} ${patient.lastName} (${patient.mrn})`,
        },
      });

      // 8. Transactional Outbox Event for Real-Time Notification
      await tx.outboxEvent.create({
        data: {
          tenantId,
          eventType: 'PATIENT_ADMITTED',
          aggregateType: 'Admission',
          aggregateId: admission.id,
          payload: {
            admissionId: admission.id,
            patientId: patient.id,
            patientName: `${patient.firstName} ${patient.lastName}`,
            mrn: patient.mrn,
            bedNumber: admission.bed?.bedNumber || 'Unassigned',
            department: dto.department,
            admittedAt: admission.admissionDate,
          },
        },
      });

      this.logger.log(`Workflow admission completed: ${admission.id} for patient ${patient.mrn}`);
      return admission;
    });
  }
}

