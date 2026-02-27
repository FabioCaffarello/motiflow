import { Story } from '../entities/story';
import { StoryPoints } from '../value-objects/story-points';
import { DomainError } from '../errors/domain-error';

export interface SprintCapacity {
  totalPoints: number;
  usedPoints: number;
  availablePoints: number;
}

/**
 * SprintPlanningService
 * 
 * Domain service for sprint planning business logic.
 */
export class SprintPlanningService {
  /**
   * Calculate sprint capacity based on stories
   */
  calculateCapacity(stories: Story[]): SprintCapacity {
    const totalPoints = stories.reduce((total, story) => {
      const points = story.getStoryPoints()?.getValue();
      return total + (points || 0);
    }, 0);

    // For now, assume capacity is based on total points
    // In a real scenario, this might consider team velocity, etc.
    const usedPoints = totalPoints;
    const availablePoints = Math.max(0, 100 - usedPoints); // Example: 100 point capacity

    return {
      totalPoints,
      usedPoints,
      availablePoints,
    };
  }

  /**
   * Check if a story can fit in sprint capacity
   */
  canAddStoryToSprint(
    stories: Story[],
    newStory: Story,
    capacityLimit?: number
  ): boolean {
    const currentCapacity = this.calculateCapacity(stories);
    const newStoryPoints = newStory.getStoryPoints()?.getValue() || 0;
    
    if (capacityLimit === undefined) {
      return true; // No limit set
    }
    
    return currentCapacity.usedPoints + newStoryPoints <= capacityLimit;
  }

  /**
   * Validate sprint planning constraints
   */
  validateSprintPlanning(
    stories: Story[],
    capacityLimit?: number
  ): void {
    if (capacityLimit === undefined) {
      return; // No validation if no limit
    }

    const capacity = this.calculateCapacity(stories);
    
    if (capacity.usedPoints > capacityLimit) {
      throw new DomainError(
        `Sprint capacity exceeded: ${capacity.usedPoints} points used, limit is ${capacityLimit}`
      );
    }
  }

  /**
   * Estimate sprint velocity based on historical data
   * This is a placeholder - in a real scenario, this would use historical sprint data
   */
  estimateVelocity(historicalSprints: Array<{ completedPoints: number }>): number {
    if (historicalSprints.length === 0) {
      return 0;
    }

    const totalPoints = historicalSprints.reduce(
      (sum, sprint) => sum + sprint.completedPoints,
      0
    );

    return Math.round(totalPoints / historicalSprints.length);
  }
}
