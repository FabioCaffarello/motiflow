import { Epic } from '../entities/epic';
import { Story } from '../entities/story';
import { EpicStatus } from '../value-objects/status';
import { DomainError } from '../errors/domain-error';

/**
 * EpicService
 * 
 * Domain service for complex Epic business logic that doesn't belong to a single entity.
 */
export class EpicService {
  /**
   * Check if an epic can be completed
   * An epic can only be completed if all its stories are done
   */
  canCompleteEpic(epic: Epic): boolean {
    const stories = epic.getStories();
    
    if (stories.length === 0) {
      return true; // Epic with no stories can be completed
    }
    
    return stories.every(story => story.getStatus().getValue() === 'DONE');
  }

  /**
   * Calculate epic completion percentage
   */
  calculateCompletionPercentage(epic: Epic): number {
    const stories = epic.getStories();
    
    if (stories.length === 0) {
      return epic.getStatus().getValue() === 'COMPLETED' ? 100 : 0;
    }
    
    const completedStories = stories.filter(
      story => story.getStatus().getValue() === 'DONE'
    ).length;
    
    return Math.round((completedStories / stories.length) * 100);
  }

  /**
   * Validate epic can transition to a new status
   */
  validateStatusTransition(epic: Epic, newStatus: EpicStatus): void {
    const currentStatus = epic.getStatus();
    
    // If trying to complete, check if all stories are done
    if (newStatus.getValue() === 'COMPLETED') {
      if (!this.canCompleteEpic(epic)) {
        throw new DomainError(
          'Cannot complete epic: all stories must be done first'
        );
      }
    }
    
    // Validate status transition rules
    if (!currentStatus.canTransitionTo(newStatus)) {
      throw new DomainError(
        `Cannot transition epic from ${currentStatus.getValue()} to ${newStatus.getValue()}`
      );
    }
  }

  /**
   * Calculate total story points for an epic
   */
  calculateTotalStoryPoints(epic: Epic): number {
    return epic.getStories().reduce((total, story) => {
      const points = story.getStoryPoints()?.getValue();
      return total + (points || 0);
    }, 0);
  }
}
