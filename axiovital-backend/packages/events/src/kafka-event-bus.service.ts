import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { IDomainEvent, IEventBus } from './event-bus.interface';

@Injectable()
export class KafkaEventBus implements IEventBus, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaEventBus.name);
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private consumer: Consumer | null = null;
  private isConnected = false;
  private readonly handlers = new Map<string, Array<(event: IDomainEvent) => Promise<void>>>();

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get<string>('kafka.clientId', 'axiovital-backend'),
      brokers: this.configService.get<string[]>('kafka.brokers', ['localhost:19092']),
      retry: { initialRetryTime: 300, retries: 2 },
    });
    this.producer = this.kafka.producer({ allowAutoTopicCreation: true });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.producer.connect();
      this.isConnected = true;
      this.logger.log('Kafka producer connected successfully 📡');
    } catch (e) {
      this.isConnected = false;
      this.logger.warn(`Kafka broker not reachable (${(e as Error).message}). Running in Local Event Bus mode ⚡`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.producer.disconnect();
        if (this.consumer) await this.consumer.disconnect();
        this.logger.log('Kafka connections closed.');
      } catch (e) {
        // ignore on cleanup
      }
    }
  }

  async publish<T>(event: IDomainEvent<T>): Promise<void> {
    if (this.isConnected) {
      try {
        await this.producer.send({
          topic: event.eventType,
          messages: [{
            key: event.aggregateId,
            value: JSON.stringify(event),
            headers: {
              eventId: event.eventId,
              eventType: event.eventType,
              tenantId: event.tenantId,
              correlationId: event.correlationId || '',
              version: String(event.version),
            },
          }],
        });
        this.logger.debug(`Event published to Kafka: ${event.eventType} (${event.aggregateId})`);
        return;
      } catch (e) {
        this.logger.warn(`Kafka publish failed, falling back to in-memory bus: ${(e as Error).message}`);
      }
    }

    // In-memory event bus fallback
    const handlers = this.handlers.get(event.eventType);
    if (handlers) {
      Promise.all(handlers.map((h) => h(event))).catch((err) => {
        this.logger.error(`Error in local handler for ${event.eventType}: ${err.message}`);
      });
    }
  }

  subscribe<T>(eventType: string, handler: (event: IDomainEvent<T>) => Promise<void>): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler as (event: IDomainEvent) => Promise<void>);
    this.handlers.set(eventType, existing);
  }

  async startConsuming(): Promise<void> {
    if (!this.isConnected || this.handlers.size === 0) return;
    try {
      const groupId = this.configService.get<string>('kafka.consumerGroup', 'axiovital-backend-group');
      this.consumer = this.kafka.consumer({ groupId });
      await this.consumer.connect();
      for (const topic of this.handlers.keys()) {
        await this.consumer.subscribe({ topic, fromBeginning: false });
      }
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          const handlers = this.handlers.get(payload.topic);
          if (!handlers || !payload.message.value) return;
          try {
            const event = JSON.parse(payload.message.value.toString()) as IDomainEvent;
            await Promise.all(handlers.map((h) => h(event)));
          } catch (e) {
            this.logger.error(`Error processing event from ${payload.topic}: ${(e as Error).message}`);
          }
        },
      });
    } catch (e) {
      this.logger.warn(`Kafka consumer start skipped: ${(e as Error).message}`);
    }
  }
}
