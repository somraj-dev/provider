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
   * Generate unique MRN (Medical Record Number): MRN-YYYYMMDD-XXXX
   */
  private async generateMRN(tenantId: string): Promise<string> {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.patient.count({ where: { tenantId } });
    const sequence = String(count + 1).padStart(4, '0');
    return `MRN-${todayStr}-${sequence}`;
  }

  async createPatient(tenantId: string, dto: CreatePatientDto, actorId: string) {
    const mrn = await this.generateMRN(tenantId);

    const patient = await this.prisma.patient.create({
      data: {
        tenantId,
        mrn,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender,
        bloodGroup: dto.bloodGroup,
        maritalStatus: dto.maritalStatus,
        nationalId: dto.nationalId,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country || 'IN',
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        emergencyContactRel: dto.emergencyContactRel,
        primaryDoctorId: dto.primaryDoctorId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.CREATE,
        resourceType: 'Patient',
        resourceId: patient.id,
        description: `Created patient record ${patient.mrn} (${patient.firstName} ${patient.lastName})`,
      },
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
