import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, IsArray, ValidateNested, IsDateString, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, ClaimStatus } from '@prisma/client';

export class InvoiceItemDto {
  @ApiProperty({ example: 'Consultation Fee - Dr. Smith' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 150.00 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Patient UUID' })
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items!: InvoiceItemDto[];

  @ApiPropertyOptional({ example: 12.50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ example: 10.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiProperty({ example: '2026-08-30' })
  @IsDateString()
  dueDate!: string;
}

export class RecordPaymentDto {
  @ApiProperty({ description: 'Invoice UUID' })
  @IsString()
  @IsNotEmpty()
  invoiceId!: string;

  @ApiProperty({ example: 152.50 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ enum: PaymentMethod, example: 'CREDIT_CARD' })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({ example: 'TXN-984128374' })
  @IsOptional()
  @IsString()
  transactionReference?: string;
}

export class SubmitInsuranceClaimDto {
  @ApiProperty({ description: 'Patient UUID' })
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ description: 'Invoice UUID' })
  @IsString()
  @IsNotEmpty()
  invoiceId!: string;

  @ApiProperty({ example: 'Star Health Insurance' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  providerName!: string;

  @ApiProperty({ example: 'POL-987654321' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  policyNumber!: string;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @Min(0.01)
  claimAmount!: number;
}

export class UpdateClaimStatusDto {
  @ApiProperty({ enum: ClaimStatus, example: 'APPROVED' })
  @IsEnum(ClaimStatus)
  status!: ClaimStatus;

  @ApiPropertyOptional({ example: 450.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedAmount?: number;
}
