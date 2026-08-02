import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './ws.gateway';

@Global()
@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class WsModule {}
