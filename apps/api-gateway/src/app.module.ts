import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Infrastructure Packages
import {
  appConfig, databaseConfig, redisConfig, minioConfig,
  kafkaConfig, opensearchConfig, jwtConfig, logConfig,
  GlobalExceptionFilter,
  RequestLoggingInterceptor, ResponseTransformInterceptor,
  RolesGuard,
} from '@axiovital/common';
import { DatabaseModule } from '@axiovital/database';
import { LoggerConfigModule } from '@axiovital/logger';
import { EventModule } from '@axiovital/events';
import { StorageModule } from '@axiovital/storage';
import { AuthModule, JwtAuthGuard } from '@axiovital/auth';

// Domain Modules
import { PatientModule } from '@axiovital/module-patient';
import { DoctorModule } from '@axiovital/module-doctor';
import { AppointmentModule } from '@axiovital/module-appointment';
import { AdmissionModule } from '@axiovital/module-admission';
import { EmergencyModule } from '@axiovital/module-emergency';
import { LaboratoryModule } from '@axiovital/module-laboratory';
import { RadiologyModule } from '@axiovital/module-radiology';
import { PharmacyModule } from '@axiovital/module-pharmacy';
import { BillingModule } from '@axiovital/module-billing';
import { ConsentModule } from '@axiovital/module-consent';
import { NotificationModule } from '@axiovital/module-notification';
import { MessagingModule } from '@axiovital/module-messaging';
import { AnalyticsModule } from '@axiovital/module-analytics';

// Local modules
import { HealthModule } from './health/health.module';
import { WsModule } from './ws/ws.module';

@Module({
  imports: [
    WsModule,
    // ---- Configuration ----
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, minioConfig, kafkaConfig, opensearchConfig, jwtConfig, logConfig],
      envFilePath: ['.env', '.env.example'],
      expandVariables: true,
    }),

    // ---- Infrastructure Packages ----
    LoggerConfigModule,
    DatabaseModule,
    EventModule,
    StorageModule,

    // ---- Auth ----
    AuthModule,

    // ---- Domain Modules ----
    PatientModule,
    DoctorModule,
    AppointmentModule,
    AdmissionModule,
    EmergencyModule,
    LaboratoryModule,
    RadiologyModule,
    PharmacyModule,
    BillingModule,
    ConsentModule,
    NotificationModule,
    MessagingModule,
    AnalyticsModule,

    // ---- System ----
    HealthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
