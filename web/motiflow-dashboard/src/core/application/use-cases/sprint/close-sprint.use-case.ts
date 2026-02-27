/**
 * Close Sprint Use Case
 * 
 * Closes a sprint and generates a report.
 * Uses Aggregate Pattern - Sprint is the aggregate root.
 */

import { SprintRepositoryPort } from '@/core/ports/repositories/sprint-repository.port';
import { EventBusPort } from '@/core/ports/event-bus.port';
import { SprintId } from '@/core/domain/value-objects/identifier';
import { EntityNotFoundError } from '@/core/domain/errors/domain-error';
import type { Sprint } from '@/core/domain/entities/sprint';

export interface CloseSprintCommand {
  id: string;
  generateReport?: boolean;
}

export interface SprintReport {
  sprintId: string;
  sprintName: string;
  totalStories: number;
  completedStories: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  completionRate: number;
}

/**
 * Close Sprint Use Case
 * 
 * Closes a sprint and optionally generates a report.
 */
export class CloseSprintUseCase {
  constructor(
    private sprintRepository: SprintRepositoryPort,
    private eventBus: EventBusPort
  ) {}

  async execute(command: CloseSprintCommand): Promise<{ sprint: Sprint; report?: SprintReport }> {
    const sprintId = SprintId.create(command.id);
    const sprint = await this.sprintRepository.findById(sprintId);

    if (!sprint) {
      throw new EntityNotFoundError('Sprint', command.id);
    }

    // Close the sprint
    sprint.complete();

    const savedSprint = await this.sprintRepository.save(sprint);

    // Generate report if requested
    let report: SprintReport | undefined;
    if (command.generateReport) {
      report = this.generateReport(savedSprint);
    }

    // Publish events
    const events = savedSprint.getDomainEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    savedSprint.clearDomainEvents();

    return { sprint: savedSprint, report };
  }

  private generateReport(sprint: Sprint): SprintReport {
    const stories = sprint.getStories();
    const totalStories = stories.length;
    const completedStories = stories.filter(
      (s) => s.getStatus().getValue() === 'DONE'
    ).length;

    let totalStoryPoints = 0;
    let completedStoryPoints = 0;

    stories.forEach((story) => {
      const points = story.getStoryPoints()?.getValue() || 0;
      totalStoryPoints += points;
      if (story.getStatus().getValue() === 'DONE') {
        completedStoryPoints += points;
      }
    });

    const completionRate = totalStoryPoints > 0
      ? (completedStoryPoints / totalStoryPoints) * 100
      : 0;

    return {
      sprintId: sprint.id.getValue(),
      sprintName: sprint.getName(),
      totalStories,
      completedStories,
      totalStoryPoints,
      completedStoryPoints,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }
}
