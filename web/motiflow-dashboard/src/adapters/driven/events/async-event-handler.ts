/**
 * Async Event Handler
 * 
 * Handles events asynchronously for non-blocking operations.
 * Uses Observer Pattern for event handling.
 */

import type { DomainEvent } from '@/core/domain/events/domain-event';
import type { EventHandler } from '@/core/application/mediators/event-mediator';

/**
 * Async Event Handler Implementation
 * 
 * Executes event handlers asynchronously without blocking the main flow.
 */
export class AsyncEventHandlerAdapter {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  /**
   * Register async handler for event type
   */
  register<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler as EventHandler);
  }

  /**
   * Handle event asynchronously
   */
  async handle(event: DomainEvent): Promise<void> {
    const eventType = event.getEventName();
    const handlers = this.handlers.get(eventType);

    if (!handlers || handlers.size === 0) {
      return;
    }

    // Execute all handlers asynchronously (fire and forget)
    Array.from(handlers).forEach((handler) => {
      Promise.resolve(handler(event)).catch((error) => {
        console.error(`Error in async handler for ${eventType}:`, error);
      });
    });
  }
}
