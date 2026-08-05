import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const tenantId = client.handshake.query.tenantId as string;
    if (tenantId) {
      client.join(`tenant:${tenantId}`);
      this.logger.log(`Client connected: ${client.id} joined room tenant:${tenantId}`);
    } else {
      this.logger.log(`Client connected: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.room) {
      client.join(data.room);
      this.logger.log(`Client ${client.id} joined custom room ${data.room}`);
    }
  }

  // Public method for services to broadcast real-time events to connected clients
  broadcastToTenant(tenantId: string, event: string, payload: any) {
    if (this.server) {
      this.server.to(`tenant:${tenantId}`).emit(event, payload);
      this.logger.debug(`Broadcast event '${event}' to tenant:${tenantId}`);
    }
  }

  broadcastGlobal(event: string, payload: any) {
    if (this.server) {
      this.server.emit(event, payload);
    }
  }
}
