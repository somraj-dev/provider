import {
  Injectable, Logger, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import { CreateConsentDto, RevokeConsentDto, VerifyConsentDto } from './dto/consent.dto';
import { ConsentStatus, ConsentScope, AuditAction } from '@prisma/client';

@Injectable()
export class ConsentService {
  private readonly logger = new Logger(ConsentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async grantConsent(tenantId: string, dto: CreateConsentDto, actorId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });
    if (!patient) throw new NotFoundException(`Patient ${dto.patientId} not found`);

    if (dto.grantedToUserId) {
      const user = await this.prisma.user.findFirst({
        where: { id: dto.grantedToUserId, tenantId },
      });
      if (!user) throw new NotFoundException(`User ${dto.grantedToUserId} not found`);
    }

    const validFrom = new Date(dto.validFrom);
    const validTo = new Date(dto.validTo);
    if (validTo <= validFrom) {
      throw new BadRequestException('validTo date must be after validFrom date');
    }

    const consent = await this.prisma.patientConsent.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        grantedToUserId: dto.grantedToUserId,
        scope: dto.scope || ConsentScope.ALL_RECORDS,
        purpose: dto.purpose,
        validFrom,
        validTo,
        status: ConsentStatus.GRANTED,
      },
      include: {
        patient: { select: { firstName: true, lastName: true, mrn: true } },
        grantedToUser: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.CONSENT_GRANTED,
        resourceType: 'PatientConsent',
        resourceId: consent.id,
        description: `Granted ${consent.scope} consent for patient ${patient.mrn} (Purpose: ${dto.purpose})`,
      },
    });

    this.logger.log(`Consent granted for patient ${dto.patientId} to user ${dto.grantedToUserId || 'Tenant-Wide'}`);
    return consent;
  }

  async revokeConsent(tenantId: string, consentId: string, dto: RevokeConsentDto, actorId: string) {
    const consent = await this.prisma.patientConsent.findFirst({
      where: { id: consentId, tenantId },
      include: { patient: true },
    });
    if (!consent) throw new NotFoundException(`Consent artifact ${consentId} not found`);

    if (consent.status === ConsentStatus.REVOKED) {
      throw new BadRequestException('Consent artifact has already been revoked');
    }

    const updated = await this.prisma.patientConsent.update({
      where: { id: consentId },
      data: {
        status: ConsentStatus.REVOKED,
        revokedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.CONSENT_REVOKED,
        resourceType: 'PatientConsent',
        resourceId: consentId,
        description: `Revoked consent for patient ${consent.patient.mrn} (Reason: ${dto.reason})`,
      },
    });

    this.logger.log(`Consent ${consentId} revoked for patient ${consent.patientId}`);
    return updated;
  }

  async verifyConsent(tenantId: string, dto: VerifyConsentDto) {
    const now = new Date();

    const activeConsent = await this.prisma.patientConsent.findFirst({
      where: {
        tenantId,
        patientId: dto.patientId,
        status: ConsentStatus.GRANTED,
        validFrom: { lte: now },
        validTo: { gte: now },
        OR: [
          { grantedToUserId: dto.userId },
          { grantedToUserId: null }, // Tenant-wide consent
        ],
        ...(dto.requestedScope ? {
          OR: [
            { scope: ConsentScope.ALL_RECORDS },
            { scope: dto.requestedScope },
          ],
        } : {}),
      },
    });

    const isGranted = Boolean(activeConsent);

    return {
      patientId: dto.patientId,
      userId: dto.userId,
      isConsentActive: isGranted,
      scope: activeConsent?.scope || null,
      validUntil: activeConsent?.validTo || null,
      decision: isGranted ? 'ACCESS_ALLOWED' : 'ACCESS_DENIED_NO_ACTIVE_CONSENT',
    };
  }

  async listPatientConsents(tenantId: string, patientId: string) {
    return this.prisma.patientConsent.findMany({
      where: { tenantId, patientId },
      orderBy: { grantedAt: 'desc' },
      include: {
        grantedToUser: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }
}
