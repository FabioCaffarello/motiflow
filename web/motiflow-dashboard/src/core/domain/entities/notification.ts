/**
 * Notification Entity
 * 
 * Represents a notification in the system.
 * Uses Observer Pattern - notifications are created from domain events.
 */

import { DomainEvent } from '../events/domain-event';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationStatus = 'unread' | 'read' | 'archived';

export class Notification {
  private constructor(
    public readonly id: string,
    private userId: string,
    private title: string,
    private message: string,
    private type: NotificationType,
    private status: NotificationStatus,
    private relatedEntityType?: string,
    private relatedEntityId?: string,
    private actionUrl?: string,
    public readonly createdAt: Date,
    private readAt?: Date
  ) {}

  static create(params: {
    id?: string;
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    relatedEntityType?: string;
    relatedEntityId?: string;
    actionUrl?: string;
  }): Notification {
    return new Notification(
      params.id || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      params.userId,
      params.title,
      params.message,
      params.type || 'info',
      'unread',
      params.relatedEntityType,
      params.relatedEntityId,
      params.actionUrl,
      new Date()
    );
  }

  static reconstitute(params: {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    status: NotificationStatus;
    relatedEntityType?: string;
    relatedEntityId?: string;
    actionUrl?: string;
    createdAt: Date;
    readAt?: Date;
  }): Notification {
    return new Notification(
      params.id,
      params.userId,
      params.title,
      params.message,
      params.type,
      params.status,
      params.relatedEntityType,
      params.relatedEntityId,
      params.actionUrl,
      params.createdAt,
      params.readAt
    );
  }

  markAsRead(): void {
    if (this.status === 'unread') {
      this.status = 'read';
      this.readAt = new Date();
    }
  }

  archive(): void {
    this.status = 'archived';
  }

  getUserId(): string {
    return this.userId;
  }

  getTitle(): string {
    return this.title;
  }

  getMessage(): string {
    return this.message;
  }

  getType(): NotificationType {
    return this.type;
  }

  getStatus(): NotificationStatus {
    return this.status;
  }

  getRelatedEntityType(): string | undefined {
    return this.relatedEntityType;
  }

  getRelatedEntityId(): string | undefined {
    return this.relatedEntityId;
  }

  getActionUrl(): string | undefined {
    return this.actionUrl;
  }

  getReadAt(): Date | undefined {
    return this.readAt;
  }

  isUnread(): boolean {
    return this.status === 'unread';
  }
}
