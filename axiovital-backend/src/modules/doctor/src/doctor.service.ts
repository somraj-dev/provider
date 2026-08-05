import {
  Injectable, Logger, NotFoundException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import { CreateDoctorDto, UpdateDoctorScheduleDto } from './dto/doctor.dto';
import { DoctorSpecialization, AuditAction } from '@prisma/client';

@Injectable()
export class DoctorService {
  private readonly logger = new Logger(DoctorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createDoctor(tenantId: string, dto: CreateDoctorDto, actorId: string) {
    // Check if user exists in tenant
    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId, tenantId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found in this tenant`);
    }

    // Check if user already has a doctor profile
    const existingDoc = await this.prisma.doctor.findUnique({
      where: { userId: dto.userId },
    });
    if (existingDoc) {
      throw new ConflictException('User already has a doctor profile');
    }

    // Check license uniqueness
    const existingLicense = await this.prisma.doctor.findUnique({
      where: { licenseNumber: dto.licenseNumber },
    });
    if (existingLicense) {
      throw new ConflictException('Doctor with this license number already exists');
    }

    const doctor = await this.prisma.doctor.create({
      data: {
        tenantId,
        userId: dto.userId,
        licenseNumber: dto.licenseNumber,
        npi: dto.npi,
        specialization: dto.specialization,
        subSpecialty: dto.subSpecialty,
        qualifications: dto.qualifications,
        department: dto.department,
        consultationFee: dto.consultationFee,
        schedule: dto.schedule || {},
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.CREATE,
        resourceType: 'Doctor',
        resourceId: doctor.id,
        description: `Created doctor profile for Dr. ${doctor.user.lastName} (${doctor.specialization})`,
      },
    });

    this.logger.log(`Doctor created: ${doctor.id} in tenant ${tenantId}`);
    return doctor;
  }

  async getDoctorById(tenantId: string, doctorId: string) {
    const doctor = await this.prisma.doctor.findFirst({
      where: { id: doctorId, tenantId },
      include: {
        user: {
          select: {
            id: true, firstName: true, lastName: true, displayName: true,
            email: true, phone: true, avatarUrl: true, status: true,
          },
        },
        _count: { select: { primaryPatients: true } },
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    return doctor;
  }

  async listDoctors(
    tenantId: string,
    specialization?: DoctorSpecialization,
    department?: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const whereClause = {
      tenantId,
      ...(specialization ? { specialization } : {}),
      ...(department ? { department: { contains: department, mode: 'insensitive' as const } } : {}),
    };

    const [doctors, total] = await this.prisma.$transaction([
      this.prisma.doctor.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
        },
      }),
      this.prisma.doctor.count({ where: whereClause }),
    ]);

    return {
      data: doctors,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateSchedule(tenantId: string, doctorId: string, dto: UpdateDoctorScheduleDto) {
    await this.getDoctorById(tenantId, doctorId);

    const updated = await this.prisma.doctor.update({
      where: { id: doctorId },
      data: { schedule: dto.schedule },
    });

    return updated;
  }
}
