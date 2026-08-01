import {
  IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, Min, Max, IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DrugInteractionCheckDto {
  @ApiProperty({ example: ['Warfarin', 'Aspirin', 'Amoxicillin'] })
  @IsArray()
  @IsString({ each: true })
  medications!: string[];

  @ApiPropertyOptional({ example: ['Penicillin'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  patientAllergies?: string[];
}

export class DifferentialDiagnosisDto {
  @ApiProperty({ example: ['Chest pain', 'Shortness of breath', 'Diaphoresis', 'Radiation to left arm'] })
  @IsArray()
  @IsString({ each: true })
  symptoms!: string[];

  @ApiPropertyOptional({ example: { systolicBp: 150, diastolicBp: 95, heartRate: 110, oxygenSat: 93, temp: 37.2 } })
  @IsOptional()
  @IsObject()
  vitalsSnapshot?: Record<string, any>;

  @ApiPropertyOptional({ example: 58 })
  @IsOptional()
  @IsNumber()
  patientAge?: number;

  @ApiPropertyOptional({ example: 'MALE' })
  @IsOptional()
  @IsString()
  patientGender?: string;
}

export class ClinicalRiskScoreDto {
  @ApiProperty({ description: 'Patient UUID' })
  @IsString()
  @IsNotEmpty()
  patientId!: string;
}

export class SummarizeChartDto {
  @ApiProperty({ description: 'Patient UUID' })
  @IsString()
  @IsNotEmpty()
  patientId!: string;
}
