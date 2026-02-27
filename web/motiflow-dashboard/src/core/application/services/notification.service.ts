/**
 * Notification Service
 * 
 * Application service for handling notifications based on domain events.
 * Uses Observer Pattern to listen to domain events and create notifications.
 * Uses Strategy Pattern for different notification channels.
 */

import type { DomainEvent } from '@/core/domain/events/domain-event';
import type { EventBusPort } from '@/core/ports/event-bus.port';
import { Notification, type NotificationType } from '@/core/domain/entities/notification';
import type { NotificationRepositoryPort } from '@/core/ports/repositories/notification-repository.port';

/**
 * Notification Channel Strategy
 * Strategy Pattern for different notification delivery channels
 */
export interface NotificationChannelStrategy {
  send(notification: Notification): Promise<void>;
}

/**
 * In-App Notification Channel
 */
export class InAppNotificationChannel implements NotificationChannelStrategy {
  constructor(private repository: NotificationRepositoryPort) {}

  async send(notification: Notification): Promise<void> {
    await this.repository.save(notification);
  }
}

/**
 * Email Notification Channel (placeholder)
 */
export class EmailNotificationChannel implements NotificationChannelStrategy {
  async send(notification: Notification): Promise<void> {
    // Placeholder for email sending
    console.log(`[Email] Sending notification: ${notification.getTitle()}`);
  }
}

/**
 * Notification Factory
 * Factory Pattern for creating notifications from domain events
 */
export class NotificationFactory {
  static createFromEvent(
    event: DomainEvent,
    userId: string,
    type: NotificationType = 'info'
  ): Notification | null {
    const eventName = event.getEventName();

    // Map domain events to notifications
    const eventNotificationMap: Record<string, { title: string; message: string; type: NotificationType }> = {
      EpicCreated: {
        title: 'New Epic Created',
        message: 'A new epic has been created',
        type: 'info',
      },
      StoryCreated: {
        title: 'New Story Created',
        message: 'A new story has been added',
        type: 'info',
      },
      TaskCreated: {
        title: 'New Task Created',
        message: 'A new task has been assigned',
        type: 'info',
      },
      SprintStarted: {
        title: 'Sprint Started',
        message: 'A sprint has been started',
        type: 'success',
      },
      SprintCompleted: {
        title: 'Sprint Completed',
        message: 'A sprint has been completed',
        type: 'success',
      },
    };

    const config = eventNotificationMap[eventName];
    if (!config) {
      return null;
    }

    return Notification.create({
      userId,
      title: config.title,
      message: config.message,
      type: config.type,
      relatedEntityType: eventName,
    });
  }
}

/**
 * Notification Service
 * 
 * Main service for handling notifications.
 * Uses Observer Pattern to subscribe to domain events.
 */
export class NotificationService {
  private channels: NotificationChannelStrategy[] = [];

  constructor(
    private eventBus: EventBusPort,
    private repository: NotificationRepositoryPort,
    private getCurrentUserId: () => string
  ) {
    // Add default in-app channel
    this.channels.push(new InAppNotificationChannel(repository));

    // Subscribe to domain events
    this.setupEventSubscriptions();
  }

  /**
   * Add notification channel (Strategy Pattern)
   */
  addChannel(channel: NotificationChannelStrategy): void {
    this.channels.push(channel);
  }

  /**
   * Setup event subscriptions (Observer Pattern)
   */
  private setupEventSubscriptions(): void {
    // Subscribe to common events
    const eventTypes = [
      'EpicCreated',
      'StoryCreated',
      'TaskCreated',
      'SprintStarted',
      'SprintCompleted',
    ];

    eventTypes.forEach((eventType) => {
      this.eventBus.subscribe(eventType, async (event) => {
        const userId = this.getCurrentUserId();
        const notification = NotificationFactory.createFromEvent(event, userId);

        if (notification) {
          // Send through all channels (Strategy Pattern)
          await Promise.all(
            this.channels.map((channel) => channel.send(notification))
          );
        }
      });
    });
  }

  /**
   * Send notification directly
   */
  async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'info',
    actionUrl?: string
  ): Promise<void> {
    const notification = Notification.create({
      userId,
      title,
      message,
      type,
      actionUrl,
    });

    // Send through all channels
    await Promise.all(
      this.channels.map((channel) => channel.send(notification))
    );
  }

  /**
   * Handle domain event and create notification
   */
  async handleEvent(event: DomainEvent): Promise<void> {
    const userId = this.getCurrentUserId();
    const notification = NotificationFactory.createFromEvent(event, userId);

    if (notification) {
      await Promise.all(
        this.channels.map((channel) => channel.send(notification))
      );
    }
  }
}
