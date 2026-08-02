import {
  Injectable, Logger, NotFoundException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import {
  CreatePatientDto, AddAllergyDto, RecordVitalDto, AddConditionDto,
} from './dto/patient.dto';
import { AuditAction } from '@prisma/client';

@Injectable()
export class PatientService {
  private readonly logger = new Logger(PatientService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate unique MRN (Medical Record Number) using MrnSequence table.
   * Uses SELECT ... FOR UPDATE to prevent race conditions.
   * Format: MRN-{sequence padded to 7 digits}
   */
  private async generateMRN(tenantId: string, tx?: any): Promise<string> {
    const prisma = tx || this.prisma;
    const prefix = 'MRN';

    // Upsert + increment atomically using raw SQL for safety
    const result = await prisma.$queryRaw<Array<{ last_value: number }>>`
      INSERT INTO mrn_sequences (id, tenant_id, prefix, last_value, updated_at)
      VALUES (gen_random_uuid(), ${tenantId}::uuid, ${prefix}, 1, NOW())
      ON CONFLICT (tenant_id, prefix)
      DO UPDATE SET last_value = mrn_sequences.last_value + 1, updated_at = NOW()
      RETURNING last_value
    `;

    const sequence = String(result[0].last_value).padStart(7, '0');
    return `${prefix}-${sequence}`;
  }

  async createPatient(tenantId: string, dto: CreatePatientDto, actorId: string) {
    const patient = await this.prisma.$transaction(async (tx) => {
      const mrn = await this.generateMRN(tenantId, tx);

      const created = await tx.patient.create({
        data: {
          tenantId,
          mrn,
          title: dto.title,
          firstName: dto.firstName,
          middleName: dto.middleName,
          lastName: dto.lastName,
          dateOfBirth: new Date(dto.dateOfBirth),
          gender: dto.gender,
          bloodGroup: dto.bloodGroup,
          maritalStatus: dto.maritalStatus,
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
          emergencyContactName: dto.emergencyContactName,
          emergencyContactPhone: dto.emergencyContactPhone,
          emergencyContactRel: dto.emergencyContactRel,
          primaryDoctorId: dto.primaryDoctorId,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId: actorId,
          action: AuditAction.CREATE,
          resourceType: 'Patient',
          resourceId: created.id,
          description: `Created patient record ${created.mrn} (${created.firstName} ${created.lastName})`,
        },
      });

      return created;
    });

    this.logger.log(`Patient created: ${patient.mrn} in tenant ${tenantId}`);
    return patient;
  }

  async getPatientById(tenantId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
      include: {
        allergies: { orderBy: { recordedAt: 'desc' } },
        vitals: { orderBy: { recordedAt: 'desc' }, take: 10 },
        conditions: { where: { isActive: true } },
        primaryDoctor: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    return patient;
  }

  async searchPatients(tenantId: string, query?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const whereClause = {
      tenantId,
      ...(query
        ? {
            OR: [
              { mrn: { contains: query, mode: 'insensitive' as const } },
              { firstName: { contains: query, mode: 'insensitive' as const } },
              { lastName: { contains: query, mode: 'insensitive' as const } },
              { phone: { contains: query } },
              { nationalId: { contains: query } },
            ],
          }
        : {}),
    };

    const [patients, total] = await this.prisma.$transaction([
      this.prisma.patient.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.patient.count({ where: whereClause }),
    ]);

    return {
      data: patients,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async addAllergy(tenantId: string, patientId: string, dto: AddAllergyDto) {
    await this.getPatientById(tenantId, patientId); // verify existence

    const allergy = await this.prisma.patientAllergy.create({
      data: {
        patientId,
        substance: dto.substance,
        reaction: dto.reaction,
        severity: dto.severity,
        isCritical: dto.isCritical ?? false,
      },
    });

    return allergy;
  }

  async recordVitals(tenantId: string, patientId: string, dto: RecordVitalDto, actorId: string) {
    await this.getPatientById(tenantId, patientId);

    let bmi: number | undefined = undefined;
    if (dto.heightCm && dto.weightKg && dto.heightCm > 0) {
      const heightMeters = dto.heightCm / 100;
      bmi = parseFloat((dto.weightKg / (heightMeters * heightMeters)).toFixed(1));
    }

    const vital = await this.prisma.patientVital.create({
      data: {
        patientId,
        systolicBp: dto.systolicBp,
        diastolicBp: dto.diastolicBp,
        heartRate: dto.heartRate,
        temperature: dto.temperature,
        respiratoryRate: dto.respiratoryRate,
        oxygenSat: dto.oxygenSat,
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
        bmi,
        recordedBy: actorId,
      },
    });

    return vital;
  }

  async addCondition(tenantId: string, patientId: string, dto: AddConditionDto) {
    await this.getPatientById(tenantId, patientId);

    const condition = await this.prisma.patientCondition.create({
      data: {
        patientId,
        name: dto.name,
        icdCode: dto.icdCode,
        onsetAge: dto.onsetAge,
      },
    });

    return condition;
  }
}
