import {
  IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationChannel, NotificationPriority } from '@prisma/client';

export class SendNotificationDto {
  @ApiProperty({ description: 'Recipient User UUID' })
  @IsString()
  @IsNotEmpty()
  recipientUserId!: string;

  @ApiProperty({ example: 'Critical Lab Alert — High Potassium Level' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'Patient John Doe (MRN: P-2026-0001) has abnormal Serum Potassium (6.2 mEq/L).' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({ enum: NotificationChannel, example: 'IN_APP' })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiPropertyOptional({ enum: NotificationPriority, example: 'URGENT' })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({ example: { patientId: '98412893', labResultId: '492810' } })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class SendMessageDto {
  @ApiProperty({ description: 'Recipient User UUID' })
  @IsString()
  @IsNotEmpty()
  recipientUserId!: string;

  @ApiProperty({ example: 'Please review CT Chest report for Patient Jane Smith.' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ description: 'Optional Patient UUID for clinical context' })
  @IsOptional()
  @IsString()
  patientId?: string;
}
