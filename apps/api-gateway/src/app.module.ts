import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Packages
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

// Local modules
import { HealthModule } from './health/health.module';

@Module({
  imports: [
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

    // ---- Auth (Phase 2) ----
    AuthModule,

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
