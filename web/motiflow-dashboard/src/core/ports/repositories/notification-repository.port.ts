/**
 * Notification Repository Port
 * 
 * Port (interface) for notification persistence operations.
 */

import type { Notification } from '@/core/domain/entities/notification';

export interface NotificationRepositoryPort {
  save(notification: Notification): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string, filters?: { status?: string; unreadOnly?: boolean }): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  archive(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}
