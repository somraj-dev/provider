import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, MaxLength,
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
