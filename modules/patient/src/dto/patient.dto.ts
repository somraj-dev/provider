import {
  IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum,
  IsDateString, IsNumber, IsBoolean, Min, Max, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, BloodGroup, MaritalStatus, AllergySeverity } from '@prisma/client';

export class CreatePatientDto {
  @ApiPropertyOptional({ example: 'Mr.', description: 'Title (Mr., Mrs., Ms., Dr.)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  title?: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiPropertyOptional({ example: 'Michael' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: '1990-05-15' })
  @IsDateString()
  dateOfBirth!: string;

  @ApiProperty({ enum: Gender, example: 'MALE' })
  @IsEnum(Gender)
  gender!: Gender;

  @ApiPropertyOptional({ enum: BloodGroup, example: 'O_POSITIVE' })
  @IsOptional()
  @IsEnum(BloodGroup)
  bloodGroup?: BloodGroup;

  @ApiPropertyOptional({ enum: MaritalStatus, example: 'SINGLE' })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional({ example: 'Indian' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ example: 'Hindu' })
  @IsOptional()
  @IsString()
  religion?: string;

  @ApiPropertyOptional({ example: 'Hindi' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'XXXX-XXXX-XXXX', description: 'Aadhaar / National ID' })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiPropertyOptional({ example: 'john.patient@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+91-9876543210' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiPropertyOptional({ example: '+91-9876543211' })
  @IsOptional()
  @IsString()
  alternateMobile?: string;

  @ApiPropertyOptional({ example: '123 Health Avenue' })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiPropertyOptional({ example: 'Near City Hospital' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiPropertyOptional({ example: 'Opposite Central Park' })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'IN' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '400001' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional({ example: '+91-9876543211' })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiPropertyOptional({ example: 'Spouse' })
  @IsOptional()
  @IsString()
  emergencyContactRel?: string;

  @ApiPropertyOptional({ description: 'Primary doctor UUID' })
  @IsOptional()
  @IsString()
  primaryDoctorId?: string;
}

export class AddAllergyDto {
  @ApiProperty({ example: 'Penicillin' })
  @IsString()
  @IsNotEmpty()
  substance!: string;

  @ApiPropertyOptional({ example: 'Anaphylaxis, Hives' })
  @IsOptional()
  @IsString()
  reaction?: string;

  @ApiProperty({ enum: AllergySeverity, example: 'SEVERE' })
  @IsEnum(AllergySeverity)
  severity!: AllergySeverity;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;
}

export class RecordVitalDto {
  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(250)
  systolicBp?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(150)
  diastolicBp?: number;

  @ApiPropertyOptional({ example: 72 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(220)
  heartRate?: number;

  @ApiPropertyOptional({ example: 98.6 })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ example: 16 })
  @IsOptional()
  @IsNumber()
  respiratoryRate?: number;

  @ApiPropertyOptional({ example: 98.5 })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(100)
  oxygenSat?: number;

  @ApiPropertyOptional({ example: 175.0, description: 'Height in cm' })
  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @ApiPropertyOptional({ example: 70.0, description: 'Weight in kg' })
  @IsOptional()
  @IsNumber()
  weightKg?: number;
}

export class AddConditionDto {
  @ApiProperty({ example: 'Essential Hypertension' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'I10' })
  @IsOptional()
  @IsString()
  icdCode?: string;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsNumber()
  onsetAge?: number;
}
