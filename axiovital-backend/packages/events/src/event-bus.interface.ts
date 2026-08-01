export interface IDomainEvent<T = unknown> {
  eventId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  tenantId: string;
  occurredAt: string;
  version: number;
  data: T;
  correlationId?: string;
  actorId?: string;
}

export interface IEventBus {
  publish<T>(event: IDomainEvent<T>): Promise<void>;
  subscribe<T>(eventType: string, handler: (event: IDomainEvent<T>) => Promise<void>): void;
}

export const EVENT_BUS = Symbol('IEventBus');
