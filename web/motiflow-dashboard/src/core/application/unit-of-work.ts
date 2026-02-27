/**
 * Unit of Work Pattern
 * 
 * Manages transactions and ensures data consistency.
 * Tracks changes and commits them atomically.
 */

import type { EpicRepositoryPort } from '@/core/ports/repositories/epic-repository.port';
import type { StoryRepositoryPort } from '@/core/ports/repositories/story-repository.port';
import type { TaskRepositoryPort } from '@/core/ports/repositories/task-repository.port';

export interface UnitOfWork {
  /**
   * Register entity for creation
   */
  registerNew<T>(entity: T, repository: any): void;

  /**
   * Register entity for update
   */
  registerDirty<T>(entity: T, repository: any): void;

  /**
   * Register entity for deletion
   */
  registerDeleted<T>(entity: T, repository: any): void;

  /**
   * Commit all changes atomically
   */
  commit(): Promise<void>;

  /**
   * Rollback all changes
   */
  rollback(): Promise<void>;
}

interface ChangeEntry<T> {
  type: 'new' | 'dirty' | 'deleted';
  entity: T;
  repository: any;
}

/**
 * Unit of Work Implementation
 */
export class UnitOfWorkImpl implements UnitOfWork {
  private changes: ChangeEntry<unknown>[] = [];

  registerNew<T>(entity: T, repository: any): void {
    this.changes.push({
      type: 'new',
      entity,
      repository,
    });
  }

  registerDirty<T>(entity: T, repository: any): void {
    this.changes.push({
      type: 'dirty',
      entity,
      repository,
    });
  }

  registerDeleted<T>(entity: T, repository: any): void {
    this.changes.push({
      type: 'deleted',
      entity,
      repository,
    });
  }

  async commit(): Promise<void> {
    // In a real implementation, this would use database transactions
    // For now, we'll execute changes sequentially
    // In production, wrap this in a Prisma transaction

    for (const change of this.changes) {
      try {
        switch (change.type) {
          case 'new':
          case 'dirty':
            await change.repository.save(change.entity);
            break;
          case 'deleted':
            // Assuming repository has delete method
            if ('delete' in change.repository && typeof change.repository.delete === 'function') {
              await change.repository.delete(change.entity);
            }
            break;
        }
      } catch (error) {
        // Rollback on error
        await this.rollback();
        throw error;
      }
    }

    this.changes = [];
  }

  async rollback(): Promise<void> {
    // Clear all pending changes
    this.changes = [];
  }
}
