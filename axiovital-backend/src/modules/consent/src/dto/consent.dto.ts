import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsentScope, ConsentStatus } from '@prisma/client';

export class CreateConsentDto {
  @ApiProperty({ description: 'Patient UUID' })
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiPropertyOptional({ description: 'Specific Doctor/User UUID granted access (optional if tenant-wide role)' })
  @IsOptional()
  @IsString()
  grantedToUserId?: string;

  @ApiPropertyOptional({ enum: ConsentScope, example: 'ALL_RECORDS' })
  @IsOptional()
  @IsEnum(ConsentScope)
  scope?: ConsentScope;

  @ApiProperty({ example: 'Consultation for Cardiology Evaluation and EKG Assessment' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  purpose!: string;

  @ApiProperty({ example: '2026-07-30T00:00:00.000Z' })
  @IsDateString()
  validFrom!: string;

  @ApiProperty({ example: '2026-10-30T23:59:59.000Z' })
  @IsDateString()
  validTo!: string;
}

export class RevokeConsentDto {
  @ApiProperty({ example: 'Patient explicitly requested revocation of consent for Dr. Smith' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}

export class VerifyConsentDto {
  @ApiProperty({ description: 'Patient UUID' })
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ description: 'Requesting User UUID' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiPropertyOptional({ enum: ConsentScope, example: 'ALL_RECORDS' })
  @IsOptional()
  @IsEnum(ConsentScope)
  requestedScope?: ConsentScope;
}
