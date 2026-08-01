import { NestFactory } from '@nestjs/core';
import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@axiovital/database';
import { EventModule, KafkaEventBus } from '@axiovital/events';
import { appConfig, databaseConfig, kafkaConfig } from '@axiovital/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, kafkaConfig],
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    EventModule,
  ],
})
export class WorkerModule {}

async function bootstrap() {
  const logger = new Logger('AxioVital-Worker');
  const app = await NestFactory.createApplicationContext(WorkerModule);
  
  logger.log('AxioVital Background Worker Application Started ⚙️');
  
  // Keep process alive listening for async background events
  process.on('SIGTERM', async () => {
    logger.log('Shutting down AxioVital Background Worker gracefully...');
    await app.close();
    process.exit(0);
  });
}
bootstrap();
