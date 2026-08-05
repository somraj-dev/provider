import { Module } from '@nestjs/common';
import { NotificationModule } from '@axiovital/module-notification';
import { MessagingController } from './messaging.controller';

@Module({
  imports: [NotificationModule],
  controllers: [MessagingController],
})
export class MessagingModule {}
