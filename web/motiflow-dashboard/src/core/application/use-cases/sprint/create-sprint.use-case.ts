import { SprintRepositoryPort } from '@/core/ports/repositories/sprint-repository.port';
import { EventBusPort } from '@/core/ports/event-bus.port';
import { Sprint } from '@/core/domain/entities/sprint';
import { SprintDuration } from '@/core/domain/value-objects/sprint-duration';
import { EntityNotFoundError } from '@/core/domain/errors/domain-error';

export interface CreateSprintCommand {
  name: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
  durationDays?: number;
}

export class CreateSprintUseCase {
  constructor(
    private sprintRepository: SprintRepositoryPort,
    private eventBus: EventBusPort
  ) {}

  async execute(command: CreateSprintCommand): Promise<Sprint> {
    // Validate dates
    let startDate = command.startDate;
    let endDate = command.endDate;

    // If duration is provided, calculate endDate from startDate
    if (command.durationDays && startDate) {
      const duration = SprintDuration.create(command.durationDays);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration.getDays());
    }

    // If both dates provided, validate
    if (startDate && endDate) {
      if (endDate < startDate) {
        throw new Error('End date cannot be before start date');
      }
    }

    const sprint = Sprint.create({
      name: command.name,
      goal: command.goal,
      startDate,
      endDate,
    });

    const savedSprint = await this.sprintRepository.save(sprint);

    // Publish events
    const events = savedSprint.getDomainEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    savedSprint.clearDomainEvents();

    return savedSprint;
  }
}
