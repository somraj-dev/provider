import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber, Min, Max, IsBoolean, ValidateNested, ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek, ScheduleOverrideType, LeaveType, AppointmentRequestType, AppointmentRequestStatus } from '@prisma/client';

export class GetAvailabilityQueryDto {
  @ApiProperty({ description: 'Practitioner (Doctor) UUID' })
  @IsString()
  @IsNotEmpty()
  practitionerId!: string;

  @ApiPropertyOptional({ description: 'Facility UUID' })
  @IsOptional()
  @IsString()
  facilityId?: string;

  @ApiPropertyOptional({ description: 'Department UUID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Appointment Type Config UUID or Code' })
  @IsOptional()
  @IsString()
  appointmentTypeId?: string;

  @ApiProperty({ example: '2026-08-05', description: 'Start date (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  from!: string;

  @ApiProperty({ example: '2026-08-11', description: 'End date (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  to!: string;

  @ApiPropertyOptional({ description: 'Appointment ID to exclude from conflict calculation during reschedule' })
  @IsOptional()
  @IsString()
  excludeAppointmentId?: string;
}

export class CreateAppointmentHoldDto {
  @ApiProperty({ description: 'Doctor UUID' })
  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @ApiProperty({ example: '2026-08-05T10:30:00Z', description: 'ISO 8601 UTC timestamp' })
  @IsDateString()
  startTime!: string;

  @ApiProperty({ example: '2026-08-05T11:00:00Z', description: 'ISO 8601 UTC timestamp' })
  @IsDateString()
  endTime!: string;
}

export class CreateScheduleRuleDto {
  @ApiProperty({ enum: DayOfWeek })
  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @ApiProperty({ example: '13:00' })
  @IsString()
  @IsNotEmpty()
  endTime!: string;
}

export class CreateScheduleTemplateDto {
  @ApiProperty({ description: 'Doctor UUID' })
  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @ApiPropertyOptional({ description: 'Facility UUID' })
  @IsOptional()
  @IsString()
  facilityId?: string;

  @ApiPropertyOptional({ description: 'Department UUID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({ example: 'Standard OPD Schedule' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  effectiveFrom!: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(5)
  @Max(60)
  slotGranularityMin!: number;

  @ApiProperty({ type: [CreateScheduleRuleDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleRuleDto)
  @ArrayMinSize(1)
  rules!: CreateScheduleRuleDto[];
}

export class CreatePractitionerLeaveDto {
  @ApiProperty({ description: 'Doctor UUID' })
  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @ApiProperty({ enum: LeaveType, example: 'ANNUAL' })
  @IsEnum(LeaveType)
  leaveType!: LeaveType;

  @ApiProperty({ example: '2026-08-10' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-08-15' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '17:00' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ example: 'Annual family vacation' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateAppointmentRequestDto {
  @ApiPropertyOptional({ description: 'Existing Appointment UUID if reschedule/cancel' })
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiProperty({ description: 'Patient UUID' })
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ enum: AppointmentRequestType, example: 'RESCHEDULE' })
  @IsEnum(AppointmentRequestType)
  requestType!: AppointmentRequestType;

  @ApiPropertyOptional({ example: 'NORMAL' })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({ example: 'Patient requested to change time' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: '2026-08-07T11:00:00Z' })
  @IsOptional()
  @IsDateString()
  requestedNewStart?: string;
}

export class CompleteAppointmentRequestDto {
  @ApiProperty({ enum: AppointmentRequestStatus, example: 'APPROVED' })
  @IsEnum(AppointmentRequestStatus)
  status!: AppointmentRequestStatus;

  @ApiPropertyOptional({ description: 'Notes on review/approval' })
  @IsOptional()
  @IsString()
  notes?: string;
}
