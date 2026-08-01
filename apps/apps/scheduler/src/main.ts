import { NestFactory } from '@nestjs/core';
import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@axiovital/database';
import { appConfig, databaseConfig } from '@axiovital/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env'],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
  ],
})
export class SchedulerModule {}

async function bootstrap() {
  const logger = new Logger('AxioVital-Scheduler');
  const app = await NestFactory.createApplicationContext(SchedulerModule);

  logger.log('AxioVital Cron Scheduler Service Started ⏱️');

  process.on('SIGTERM', async () => {
    logger.log('Shutting down AxioVital Scheduler gracefully...');
    await app.close();
    process.exit(0);
  });
}
bootstrap();
