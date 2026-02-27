import { Story } from '../entities/story';
import { StoryStatus } from '../value-objects/status';
import { DomainError } from '../errors/domain-error';

/**
 * StoryService
 * 
 * Domain service for complex Story business logic.
 */
export class StoryService {
  /**
   * Check if a story can be moved to a sprint
   * A story can only be moved to a sprint if it's in BACKLOG or PLANNED status
   */
  canMoveToSprint(story: Story): boolean {
    const status = story.getStatus().getValue();
    return status === 'BACKLOG' || status === 'PLANNED';
  }

  /**
   * Validate story can transition to a new status
   */
  validateStatusTransition(story: Story, newStatus: StoryStatus): void {
    const currentStatus = story.getStatus();
    
    // Additional business rules beyond entity-level validation
    if (newStatus.getValue() === 'DONE') {
      // Could add validation that all tasks are done, etc.
      // For now, just check transition rules
    }
    
    if (!currentStatus.canTransitionTo(newStatus)) {
      throw new DomainError(
        `Cannot transition story from ${currentStatus.getValue()} to ${newStatus.getValue()}`
      );
    }
  }

  /**
   * Calculate story completion percentage based on tasks
   */
  calculateCompletionPercentage(story: Story): number {
    const tasks = story.getTasks();
    
    if (tasks.length === 0) {
      return story.getStatus().getValue() === 'DONE' ? 100 : 0;
    }
    
    const completedTasks = tasks.filter(
      task => task.getStatus().getValue() === 'DONE'
    ).length;
    
    return Math.round((completedTasks / tasks.length) * 100);
  }

  /**
   * Check if story has all acceptance criteria satisfied
   */
  areAllAcceptanceCriteriaSatisfied(story: Story): boolean {
    const criteria = story.getAcceptanceCriteria();
    
    if (criteria.length === 0) {
      return false; // Story should have at least one acceptance criteria
    }
    
    return criteria.every(c => c.isSatisfied());
  }
}
