import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './ws.gateway';
import { OutboxProcessorService } from './outbox-processor.service';

@Global()
@Module({
  providers: [EventsGateway, OutboxProcessorService],
  exports: [EventsGateway, OutboxProcessorService],
})
export class WsModule {}
