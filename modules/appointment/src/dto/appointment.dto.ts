import {
  IsString, IsNotEmpty, IsOptional, IsEnum,
  IsDateString, IsNumber, Min, Max, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus, AppointmentType } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Patient UUID' })
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ description: 'Doctor UUID' })
  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @ApiProperty({ enum: AppointmentType, example: 'CONSULTATION' })
  @IsEnum(AppointmentType)
  type!: AppointmentType;

  @ApiProperty({ example: '2026-08-01T10:00:00Z', description: 'ISO 8601 UTC timestamp' })
  @IsDateString()
  startTime!: string;

  @ApiProperty({ example: 30, description: 'Duration in minutes' })
  @IsNumber()
  @Min(10)
  @Max(240)
  durationMinutes!: number;

  @ApiProperty({ example: 'Chest pain and shortness of breath' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({ example: 'https://meet.axiovital.com/room-123' })
  @IsOptional()
  @IsString()
  telehealthLink?: string;
}

export class UpdateAppointmentStatusDto {
  @ApiProperty({ enum: AppointmentStatus, example: 'CONFIRMED' })
  @IsEnum(AppointmentStatus)
  status!: AppointmentStatus;

  @ApiPropertyOptional({ example: 'Patient requested cancellation' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancellationReason?: string;

  @ApiPropertyOptional({ example: 'Patient completed follow-up examination' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RescheduleAppointmentDto {
  @ApiProperty({ example: '2026-08-02T14:00:00Z' })
  @IsDateString()
  newStartTime!: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(10)
  @Max(240)
  durationMinutes!: number;

  @ApiPropertyOptional({ example: 'Doctor unavailable at original time' })
  @IsOptional()
  @IsString()
  reason?: string;
}
