import { Global, Module } from '@nestjs/common';
import { KafkaEventBus } from './kafka-event-bus.service';
import { EVENT_BUS } from './event-bus.interface';

@Global()
@Module({
  providers: [{ provide: EVENT_BUS, useClass: KafkaEventBus }],
  exports: [EVENT_BUS],
})
export class EventModule {}
