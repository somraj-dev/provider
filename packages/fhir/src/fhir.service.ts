import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@axiovital/database';

@Injectable()
export class FhirService {
  private readonly logger = new Logger(FhirService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---- FHIR R4 PATIENT RESOURCE MAPPER ----

  async getFhirPatient(tenantId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
      include: { primaryDoctor: { include: { user: true } } },
    });

    if (!patient) throw new NotFoundException(`Patient ${patientId} not found`);

    return {
      resourceType: 'Patient',
      id: patient.id,
      meta: {
        versionId: '1',
        lastUpdated: patient.updatedAt.toISOString(),
        profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
      },
      identifier: [
        {
          system: 'urn:oid:axiovital:mrn',
          value: patient.mrn,
          type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR' }] },
        },
        ...(patient.nationalId ? [{
          system: 'urn:oid:axiovital:national-id',
          value: patient.nationalId,
          type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'NI' }] },
        }] : []),
      ],
      active: true,
      name: [{
        use: 'official',
        family: patient.lastName,
        given: [patient.firstName],
      }],
      telecom: [
        { system: 'phone', value: patient.phone, use: 'mobile' },
        ...(patient.email ? [{ system: 'email', value: patient.email, use: 'home' }] : []),
      ],
      gender: patient.gender.toLowerCase(),
      birthDate: patient.dateOfBirth.toISOString().slice(0, 10),
      address: [{
        use: 'home',
        line: [patient.address || ''],
        city: patient.city || '',
        state: patient.state || '',
        postalCode: patient.postalCode || '',
        country: patient.country,
      }],
      maritalStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
          code: patient.maritalStatus === 'MARRIED' ? 'M' : 'S',
        }],
      },
      generalPractitioner: patient.primaryDoctor ? [
        {
          reference: `Practitioner/${patient.primaryDoctor.id}`,
          display: `Dr. ${patient.primaryDoctor.user.firstName} ${patient.primaryDoctor.user.lastName}`,
        },
      ] : [],
    };
  }

  // ---- FHIR R4 PRACTITIONER RESOURCE MAPPER ----

  async getFhirPractitioner(tenantId: string, doctorId: string) {
    const doctor = await this.prisma.doctor.findFirst({
      where: { id: doctorId, tenantId },
      include: { user: true },
    });

    if (!doctor) throw new NotFoundException(`Practitioner ${doctorId} not found`);

    return {
      resourceType: 'Practitioner',
      id: doctor.id,
      meta: {
        versionId: '1',
        lastUpdated: doctor.updatedAt.toISOString(),
        profile: ['http://hl7.org/fhir/StructureDefinition/Practitioner'],
      },
      identifier: [
        {
          system: 'urn:oid:axiovital:license',
          value: doctor.licenseNumber,
          type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MD' }] },
        },
        ...(doctor.npi ? [{
          system: 'http://hl7.org/fhir/sid/us-npi',
          value: doctor.npi,
          type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'PRN' }] },
        }] : []),
      ],
      active: doctor.status === 'ACTIVE',
      name: [{
        use: 'official',
        prefix: ['Dr.'],
        family: doctor.user.lastName,
        given: [doctor.user.firstName],
      }],
      telecom: [
        ...(doctor.user.phone ? [{ system: 'phone', value: doctor.user.phone, use: 'work' }] : []),
        { system: 'email', value: doctor.user.email, use: 'work' },
      ],
      qualification: doctor.qualifications.map((qual) => ({
        code: { text: qual },
      })),
    };
  }

  // ---- FHIR R4 OBSERVATION RESOURCE MAPPER ----

  async getFhirObservation(tenantId: string, vitalId: string) {
    const vital = await this.prisma.patientVital.findUnique({
      where: { id: vitalId },
      include: { patient: true },
    });

    if (!vital) throw new NotFoundException(`Observation ${vitalId} not found`);

    const components: any[] = [];
    if (vital.systolicBp && vital.diastolicBp) {
      components.push({
        code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] },
        valueQuantity: { value: vital.systolicBp, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
      });
      components.push({
        code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] },
        valueQuantity: { value: vital.diastolicBp, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
      });
    }

    return {
      resourceType: 'Observation',
      id: vital.id,
      status: 'final',
      category: [{
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }],
      }],
      code: {
        coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel with all children optional' }],
      },
      subject: {
        reference: `Patient/${vital.patientId}`,
        display: `${vital.patient.firstName} ${vital.patient.lastName}`,
      },
      effectiveDateTime: vital.recordedAt.toISOString(),
      component: components,
    };
  }

  // ---- FHIR R4 ENCOUNTER RESOURCE MAPPER ----

  async getFhirEncounter(tenantId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId },
      include: { patient: true, doctor: { include: { user: true } } },
    });

    if (!appointment) throw new NotFoundException(`Encounter ${appointmentId} not found`);

    return {
      resourceType: 'Encounter',
      id: appointment.id,
      status: appointment.status === 'COMPLETED' ? 'finished' : appointment.status === 'CANCELLED' ? 'cancelled' : 'in-progress',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: appointment.type === 'TELEHEALTH' ? 'VR' : 'AMB',
        display: appointment.type === 'TELEHEALTH' ? 'virtual' : 'ambulatory',
      },
      subject: {
        reference: `Patient/${appointment.patientId}`,
        display: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      },
      participant: [{
        individual: {
          reference: `Practitioner/${appointment.doctorId}`,
          display: `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`,
        },
      }],
      period: {
        start: appointment.startTime.toISOString(),
        end: appointment.endTime.toISOString(),
      },
      reasonCode: [{ text: appointment.reason }],
    };
  }

  // ---- FHIR R4 MEDICATION REQUEST RESOURCE MAPPER ----

  async getFhirMedicationRequest(tenantId: string, prescriptionId: string) {
    const prescription = await this.prisma.prescription.findFirst({
      where: { id: prescriptionId, tenantId },
      include: {
        patient: true,
        prescribingDoctor: { include: { user: true } },
        items: { include: { inventoryItem: true } },
      },
    });

    if (!prescription) throw new NotFoundException(`MedicationRequest ${prescriptionId} not found`);

    return {
      resourceType: 'MedicationRequest',
      id: prescription.id,
      status: prescription.status === 'DISPENSED' ? 'completed' : prescription.status === 'CANCELLED' ? 'cancelled' : 'active',
      intent: 'order',
      subject: {
        reference: `Patient/${prescription.patientId}`,
        display: `${prescription.patient.firstName} ${prescription.patient.lastName}`,
      },
      requester: {
        reference: `Practitioner/${prescription.prescribingDoctorId}`,
        display: `Dr. ${prescription.prescribingDoctor.user.firstName} ${prescription.prescribingDoctor.user.lastName}`,
      },
      authoredOn: prescription.prescribedAt.toISOString(),
      dosageInstruction: prescription.items.map((item) => ({
        text: `${item.inventoryItem.name} ${item.dosage} ${item.frequency} for ${item.durationDays} days. Instructions: ${item.instructions || 'N/A'}`,
        timing: { code: { text: item.frequency } },
      })),
    };
  }
}
