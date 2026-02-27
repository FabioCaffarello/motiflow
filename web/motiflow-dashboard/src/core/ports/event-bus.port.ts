import { DomainEvent } from '../domain/events/domain-event';

export type EventHandler = (event: DomainEvent) => Promise<void> | void;

export interface EventBusPort {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}
