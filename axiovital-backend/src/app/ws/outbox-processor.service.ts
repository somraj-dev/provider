import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import { EventsGateway } from './ws.gateway';
import { OutboxEventStatus } from '@prisma/client';

@Injectable()
export class OutboxProcessorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxProcessorService.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  onModuleInit() {
    // Poll outbox every 2 seconds for low-latency real-time dispatch
    this.timer = setInterval(() => this.processOutbox(), 2000);
    this.logger.log('📡 Transactional Outbox Event Processor initialized (2s poll rate)');
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async processOutbox() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // 1. Fetch pending outbox events
      const pendingEvents = await this.prisma.outboxEvent.findMany({
        where: { status: OutboxEventStatus.PENDING },
        take: 50,
        orderBy: { createdAt: 'asc' },
      });

      if (pendingEvents.length === 0) {
        this.isProcessing = false;
        return;
      }

      for (const event of pendingEvents) {
        try {
          // 2. Broadcast event via WebSocket Gateway to tenant clients & global listeners
          const eventName = event.eventType.toLowerCase();
          this.eventsGateway.broadcastToTenant(event.tenantId, eventName, event.payload);
          this.eventsGateway.broadcastGlobal(eventName, event.payload);

          // 3. Mark outbox event as PUBLISHED
          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              status: OutboxEventStatus.PUBLISHED,
              publishedAt: new Date(),
            },
          });

          this.logger.log(`⚡ Outbox event ${event.id} (${event.eventType}) published to WebSockets`);
        } catch (err: any) {
          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              status: event.retryCount >= 5 ? OutboxEventStatus.FAILED : OutboxEventStatus.PENDING,
              retryCount: { increment: 1 },
              lastError: err.message || 'Dispatch error',
            },
          });
        }
      }
    } catch (err: any) {
      this.logger.error(`Error processing outbox events: ${err.message}`);
    } finally {
      this.isProcessing = false;
    }
  }
}
