import {
  IsString, IsNotEmpty, IsOptional, IsEnum,
  IsNumber, IsArray, Min, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DoctorSpecialization, DoctorStatus } from '@prisma/client';

export class CreateDoctorDto {
  @ApiProperty({ description: 'User UUID attached to doctor profile' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ example: 'MED-LIC-98765' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  licenseNumber!: string;

  @ApiPropertyOptional({ example: 'NPI-1234567890' })
  @IsOptional()
  @IsString()
  npi?: string;

  @ApiProperty({ enum: DoctorSpecialization, example: 'CARDIOLOGY' })
  @IsEnum(DoctorSpecialization)
  specialization!: DoctorSpecialization;

  @ApiPropertyOptional({ example: 'Interventional Cardiology' })
  @IsOptional()
  @IsString()
  subSpecialty?: string;

  @ApiProperty({ example: ['MD', 'FACC', 'MBBS'] })
  @IsArray()
  @IsString({ each: true })
  qualifications!: string[];

  @ApiProperty({ example: 'Cardiology' })
  @IsString()
  @IsNotEmpty()
  department!: string;

  @ApiProperty({ example: 150.00 })
  @IsNumber()
  @Min(0)
  consultationFee!: number;

  @ApiPropertyOptional({
    example: {
      Monday: { start: '09:00', end: '17:00' },
      Wednesday: { start: '09:00', end: '17:00' },
    },
  })
  @IsOptional()
  schedule?: Record<string, any>;
}

export class UpdateDoctorScheduleDto {
  @ApiProperty({
    example: {
      Monday: { start: '09:00', end: '17:00' },
      Tuesday: { start: '09:00', end: '17:00' },
      Wednesday: { start: '09:00', end: '17:00' },
      Thursday: { start: '09:00', end: '17:00' },
      Friday: { start: '09:00', end: '13:00' },
    },
  })
  schedule!: Record<string, any>;
}
