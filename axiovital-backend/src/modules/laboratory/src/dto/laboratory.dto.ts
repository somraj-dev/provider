import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber,
  IsBoolean, Min, IsArray, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LabOrderPriority, LabOrderStatus } from '@prisma/client';

export class CreateLabTestCatalogDto {
  @ApiProperty({ example: 'CBC-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @ApiProperty({ example: 'Complete Blood Count' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'Hematology' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category!: string;

  @ApiPropertyOptional({ example: '4.5 - 11.0 x10^3 / uL' })
  @IsOptional()
  @IsString()
  referenceRange?: string;

  @ApiPropertyOptional({ example: 'x10^3/uL' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: 45.00 })
  @IsNumber()
  @Min(0)
  price!: number;
}

export class CreateLabOrderDto {
  @ApiProperty({ description: 'Patient UUID' })
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ description: 'Ordering Doctor UUID' })
  @IsString()
  @IsNotEmpty()
  orderingDoctorId!: string;

  @ApiProperty({ enum: LabOrderPriority, example: 'ROUTINE' })
  @IsEnum(LabOrderPriority)
  priority!: LabOrderPriority;

  @ApiPropertyOptional({ example: 'Whole Blood' })
  @IsOptional()
  @IsString()
  sampleType?: string;

  @ApiPropertyOptional({ example: 'Patient fasting for 8 hours' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'List of LabTestCatalog UUIDs to perform', example: ['catalog-uuid-1'] })
  @IsArray()
  @IsString({ each: true })
  testCatalogIds!: string[];
}

export class RecordLabResultDto {
  @ApiProperty({ description: 'LabOrder UUID' })
  @IsString()
  @IsNotEmpty()
  labOrderId!: string;

  @ApiProperty({ description: 'LabTestCatalog UUID' })
  @IsString()
  @IsNotEmpty()
  labTestCatalogId!: string;

  @ApiProperty({ example: '14.2' })
  @IsString()
  @IsNotEmpty()
  resultValue!: string;

  @ApiPropertyOptional({ example: 'g/dL' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: '13.5 - 17.5 g/dL' })
  @IsOptional()
  @IsString()
  referenceRange?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isAbnormal?: boolean;

  @ApiPropertyOptional({ example: 'Slightly elevated RBC count' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLabOrderStatusDto {
  @ApiProperty({ enum: LabOrderStatus, example: 'SAMPLE_COLLECTED' })
  @IsEnum(LabOrderStatus)
  status!: LabOrderStatus;
}
