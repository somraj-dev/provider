import {
  IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsArray, ValidateNested, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty({ example: 'MED-AMOX-500' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku!: string;

  @ApiProperty({ example: 'Amoxicillin 500mg Capsule' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'Antibiotics' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category!: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  stockQuantity!: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  reorderLevel!: number;

  @ApiProperty({ example: 12.50 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiProperty({ example: 'Capsule' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unitOfMeasure!: string;
}

export class UpdateStockDto {
  @ApiProperty({ example: 100, description: 'Quantity adjustment (positive to add stock, negative to reduce stock)' })
  @IsNumber()
  quantityAdjustment!: number;

  @ApiPropertyOptional({ example: 'Received shipment batch #98421' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class PrescriptionItemDto {
  @ApiProperty({ description: 'InventoryItem (medication) UUID' })
  @IsString()
  @IsNotEmpty()
  inventoryItemId!: string;

  @ApiProperty({ example: '500mg' })
  @IsString()
  @IsNotEmpty()
  dosage!: string;

  @ApiProperty({ example: 'TDS (3 times a day)' })
  @IsString()
  @IsNotEmpty()
  frequency!: string;

  @ApiProperty({ example: 7 })
  @IsNumber()
  @Min(1)
  durationDays!: number;

  @ApiProperty({ example: 21 })
  @IsNumber()
  @Min(1)
  quantityPrescribed!: number;

  @ApiPropertyOptional({ example: 'Take after food with water' })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'Patient UUID' })
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ description: 'Prescribing Doctor UUID' })
  @IsString()
  @IsNotEmpty()
  prescribingDoctorId!: string;

  @ApiPropertyOptional({ example: 'Complete full 7-day course of antibiotics' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [PrescriptionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items!: PrescriptionItemDto[];
}
