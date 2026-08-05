import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { createGlobalValidationPipe } from '@axiovital/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 4000);
  const host = configService.get<string>('app.host', '0.0.0.0');
  const env = configService.get<string>('app.env', 'development');
  const corsOrigins = configService.get<string[]>('app.corsOrigins', ['http://localhost:3000']);

  app.use(helmet());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-Correlation-Id'],
  });

  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'health/ready', 'api/docs'],
  });

  app.useGlobalPipes(createGlobalValidationPipe());

  // Swagger
  if (env !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AxioVital Healthcare OS — API')
      .setDescription('Enterprise Healthcare Operating System API')
      .setVersion('0.1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .addTag('Health', 'System health probes')
      .addTag('Auth', 'Authentication and session management')
      .addTag('Identity', 'Users, roles, and permissions')
      .addTag('Tenants', 'Hospital and organization management')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true, docExpansion: 'none', filter: true },
      customSiteTitle: 'AxioVital API Docs',
    });
  }

  app.enableShutdownHooks();
  await app.listen(port, host);

  const logger = app.get(Logger);
  logger.log(`🏥 AxioVital API Gateway v${configService.get('app.version', '0.1.0')} on http://${host}:${port}`, 'Bootstrap');
  logger.log(`   Environment: ${env}`, 'Bootstrap');
  logger.log(`   API Docs: http://localhost:${port}/api/docs`, 'Bootstrap');
  logger.log(`   Health: http://localhost:${port}/health`, 'Bootstrap');
}

bootstrap();
