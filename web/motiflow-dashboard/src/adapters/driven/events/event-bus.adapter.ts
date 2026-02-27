import { EventBusPort, EventHandler } from '@/core/ports/event-bus.port';
import { DomainEvent } from '@/core/domain/events/domain-event';

export class EventBusAdapter implements EventBusPort {
  private handlers: Map<string, EventHandler[]> = new Map();

  async publish(event: DomainEvent): Promise<void> {
    const eventType = event.constructor.name;
    const handlers = this.handlers.get(eventType) || [];
    
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error handling event ${eventType}:`, error);
      }
    }
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}
