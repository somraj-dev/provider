import { Controller, Get, Param, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FhirService } from './fhir.service';
import { TenantId, Roles } from '@axiovital/common';

@ApiTags('FHIR R4 Interoperability Engine')
@Controller('fhir')
@ApiBearerAuth('access-token')
export class FhirController {
  constructor(private readonly fhirService: FhirService) {}

  @Get('Patient/:id')
  @Roles('DOCTOR', 'NURSE', 'TENANT_ADMIN', 'SYSTEM')
  @Header('Content-Type', 'application/fhir+json')
  @ApiOperation({ summary: 'Get HL7 FHIR R4 Patient JSON Resource' })
  @ApiParam({ name: 'id', description: 'Patient UUID' })
  async getFhirPatient(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.fhirService.getFhirPatient(tenantId, id);
  }

  @Get('Practitioner/:id')
  @Roles('DOCTOR', 'NURSE', 'TENANT_ADMIN', 'SYSTEM')
  @Header('Content-Type', 'application/fhir+json')
  @ApiOperation({ summary: 'Get HL7 FHIR R4 Practitioner JSON Resource' })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  async getFhirPractitioner(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.fhirService.getFhirPractitioner(tenantId, id);
  }

  @Get('Observation/:id')
  @Roles('DOCTOR', 'NURSE', 'TENANT_ADMIN', 'SYSTEM')
  @Header('Content-Type', 'application/fhir+json')
  @ApiOperation({ summary: 'Get HL7 FHIR R4 Observation JSON Resource (Vitals / Lab Results)' })
  @ApiParam({ name: 'id', description: 'PatientVital UUID' })
  async getFhirObservation(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.fhirService.getFhirObservation(tenantId, id);
  }

  @Get('Encounter/:id')
  @Roles('DOCTOR', 'NURSE', 'TENANT_ADMIN', 'SYSTEM')
  @Header('Content-Type', 'application/fhir+json')
  @ApiOperation({ summary: 'Get HL7 FHIR R4 Encounter JSON Resource (Appointment / Admission)' })
  @ApiParam({ name: 'id', description: 'Appointment UUID' })
  async getFhirEncounter(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.fhirService.getFhirEncounter(tenantId, id);
  }

  @Get('MedicationRequest/:id')
  @Roles('DOCTOR', 'PHARMACIST', 'TENANT_ADMIN', 'SYSTEM')
  @Header('Content-Type', 'application/fhir+json')
  @ApiOperation({ summary: 'Get HL7 FHIR R4 MedicationRequest JSON Resource (Prescription)' })
  @ApiParam({ name: 'id', description: 'Prescription UUID' })
  async getFhirMedicationRequest(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.fhirService.getFhirMedicationRequest(tenantId, id);
  }
}
