import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, MaxLength, IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdmissionPriority, BedType, BedStatus } from '@prisma/client';

export class CreateBedDto {
  @ApiProperty({ example: 'ICU-BED-01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  bedNumber!: string;

  @ApiProperty({ example: 'Cardiovascular ICU' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ward!: string;

  @ApiProperty({ enum: BedType, example: 'PRIVATE_ICU' })
  @IsEnum(BedType)
  type!: BedType;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @Min(0)
  dailyRate!: number;
}

export class AdmitPatientDto {
  @ApiProperty({ description: 'Patient UUID' })
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ description: 'Admitting doctor UUID' })
  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @ApiPropertyOptional({ description: 'Bed UUID' })
  @IsOptional()
  @IsString()
  bedId?: string;

  @ApiProperty({ enum: AdmissionPriority, example: 'URGENT' })
  @IsEnum(AdmissionPriority)
  priority!: AdmissionPriority;

  @ApiProperty({ example: 'Acute Myocardial Infarction' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  admittingDiagnosis!: string;
}

export class DischargePatientDto {
  @ApiProperty({ example: 'Patient stabilized. Discharged with prescription for Beta-Blockers.' })
  @IsString()
  @IsNotEmpty()
  dischargeSummary!: string;

  @ApiPropertyOptional({ enum: ['DISCHARGED', 'DISCHARGED_AGAINST_ADVICE', 'DECEASED'], example: 'DISCHARGED' })
  @IsOptional()
  @IsString()
  dischargeType?: string;
}

export class TransferBedDto {
  @ApiProperty({ description: 'Target Bed UUID' })
  @IsString()
  @IsNotEmpty()
  targetBedId!: string;
}

export class AdmitWorkflowDto {
  // Existing Patient ID if selecting existing patient
  @ApiPropertyOptional({ description: 'Existing Patient UUID (if selecting existing patient)' })
  @IsOptional()
  @IsString()
  patientId?: string;

  // Demographics (if creating new patient or updating)
  @ApiPropertyOptional({ example: 'Mr.' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiPropertyOptional({ example: 'M.' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: '1990-05-15' })
  @IsDateString()
  dateOfBirth!: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE', 'OTHER'], example: 'MALE' })
  @IsString()
  gender!: string;

  @ApiPropertyOptional({ example: 'SINGLE' })
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional({ example: '1234-5678-9012' })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiProperty({ example: '+91-9876543210' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+91-9876543211' })
  @IsOptional()
  @IsString()
  alternateMobile?: string;

  @ApiPropertyOptional({ example: 'O_POSITIVE' })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional({ example: 'Indian' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ example: 'Hindu' })
  @IsOptional()
  @IsString()
  religion?: string;

  @ApiPropertyOptional({ example: 'Hindi' })
  @IsOptional()
  @IsString()
  language?: string;

  // Address
  @ApiPropertyOptional({ example: '123 Main Street' })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiPropertyOptional({ example: 'Apartment 4B' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiPropertyOptional({ example: 'Near Metro Station' })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'IN' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '400001' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  // Admission details
  @ApiProperty({ example: 'ROUTINE' })
  @IsString()
  admissionType!: string;

  @ApiProperty({ example: 'INPATIENT' })
  @IsString()
  visitType!: string;

  @ApiPropertyOptional({ example: 'Dr. A. Verma' })
  @IsOptional()
  @IsString()
  referredBy?: string;

  @ApiPropertyOptional({ example: 'Dr. Herman Stewart' })
  @IsOptional()
  @IsString()
  referringDoctor?: string;

  @ApiProperty({ example: 'Cardiology' })
  @IsString()
  department!: string;

  @ApiPropertyOptional({ description: 'Bed UUID or Bed Number' })
  @IsOptional()
  @IsString()
  bedId?: string;

  @ApiPropertyOptional({ example: 'Blue Cross / Blue Shield' })
  @IsOptional()
  @IsString()
  primaryInsurance?: string;

  @ApiPropertyOptional({ example: 'INS-990812' })
  @IsOptional()
  @IsString()
  insuranceId?: string;

  @ApiPropertyOptional({ example: 'POL-55412' })
  @IsOptional()
  @IsString()
  policyId?: string;

  @ApiPropertyOptional({ description: 'Admitting doctor UUID (defaults to assigned doctor in department)' })
  @IsOptional()
  @IsString()
  doctorId?: string;
}

