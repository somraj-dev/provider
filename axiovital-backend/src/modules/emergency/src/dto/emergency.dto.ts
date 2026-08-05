import {
  IsString, IsNotEmpty, IsNumber, Min, Max, IsObject, IsOptional, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTriageDto {
  @ApiProperty({ description: 'Patient UUID' })
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ example: 1, description: '1 = Resuscitation/Immediate, 2 = Emergent, 3 = Urgent, 4 = Less Urgent, 5 = Non-Urgent' })
  @IsNumber()
  @Min(1)
  @Max(5)
  triageLevel!: number;

  @ApiProperty({ example: 'Severe chest pain radiating to left arm' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  chiefComplaint!: string;

  @ApiPropertyOptional({
    example: { systolicBp: 160, diastolicBp: 95, heartRate: 115, oxygenSat: 92, temp: 37.8 },
  })
  @IsOptional()
  @IsObject()
  vitalsSnapshot?: Record<string, any>;
}
