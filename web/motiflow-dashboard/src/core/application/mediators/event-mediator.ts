/**
 * Event Mediator
 * 
 * Mediator Pattern implementation for event routing and handling.
 * Decouples event publishers from event handlers.
 */

import type { DomainEvent } from '@/core/domain/events/domain-event';
import type { EventBusPort } from '@/core/ports/event-bus.port';

export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void> | void;

export interface EventMediator {
  /**
   * Subscribe to an event type
   */
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void;

  /**
   * Unsubscribe from an event type
   */
  unsubscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void;

  /**
   * Publish an event to all subscribers
   */
  publish(event: DomainEvent): Promise<void>;
}

/**
 * Event Mediator Implementation
 * 
 * Routes events to appropriate handlers using Mediator Pattern.
 */
export class EventMediatorImpl implements EventMediator {
  private handlers: Map<string, Set<EventHandler>>> = new Map();

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler as EventHandler);
  }

  unsubscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler as EventHandler);
    }
  }

  async publish(event: DomainEvent): Promise<void> {
    const eventType = event.getEventName();
    const handlers = this.handlers.get(eventType);

    if (!handlers || handlers.size === 0) {
      return;
    }

    // Execute all handlers in parallel
    const promises = Array.from(handlers).map((handler) => {
      try {
        return Promise.resolve(handler(event));
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }
}

/**
 * Async Event Handler Wrapper
 * 
 * Wraps event handlers to execute them asynchronously.
 */
export class AsyncEventHandler {
  constructor(
    private handler: EventHandler,
    private delay?: number
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    if (this.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }

    // Execute in background (fire and forget)
    Promise.resolve(this.handler(event)).catch((error) => {
      console.error('Error in async event handler:', error);
    });
  }
}
