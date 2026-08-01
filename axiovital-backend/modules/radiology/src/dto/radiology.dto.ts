import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImagingModality, ImagingOrderStatus } from '@prisma/client';

export class CreateImagingOrderDto {
  @ApiProperty({ description: 'Patient UUID' })
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ description: 'Ordering Doctor UUID' })
  @IsString()
  @IsNotEmpty()
  orderingDoctorId!: string;

  @ApiProperty({ enum: ImagingModality, example: 'CT' })
  @IsEnum(ImagingModality)
  modality!: ImagingModality;

  @ApiProperty({ example: 'Chest & Abdomen with Contrast' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bodyPart!: string;

  @ApiProperty({ example: 'Rule out pulmonary embolism and aortic dissection' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;
}

export class AttachImagingStudyDto {
  @ApiProperty({ description: 'ImagingOrder UUID' })
  @IsString()
  @IsNotEmpty()
  imagingOrderId!: string;

  @ApiProperty({ example: '1.2.840.113619.2.55.3.283115949.768.1698293847', description: 'Unique DICOM Study Instance UID' })
  @IsString()
  @IsNotEmpty()
  dicomStudyInstanceUid!: string;

  @ApiPropertyOptional({ description: 'FileMetadata UUID (MinIO S3 object reference)' })
  @IsOptional()
  @IsString()
  fileMetadataId?: string;

  @ApiPropertyOptional({ description: 'Performing Radiologist Doctor UUID' })
  @IsOptional()
  @IsString()
  performingRadiologistId?: string;

  @ApiPropertyOptional({ example: 'FINDINGS: Bilateral clear lung fields. No focal consolidation. IMPRESSION: Normal CT Chest.' })
  @IsOptional()
  @IsString()
  radiologyReport?: string;
}

export class UpdateImagingStatusDto {
  @ApiProperty({ enum: ImagingOrderStatus, example: 'FINALIZED' })
  @IsEnum(ImagingOrderStatus)
  status!: ImagingOrderStatus;
}
