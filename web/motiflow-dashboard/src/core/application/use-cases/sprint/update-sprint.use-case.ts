import { SprintRepositoryPort } from '@/core/ports/repositories/sprint-repository.port';
import { EventBusPort } from '@/core/ports/event-bus.port';
import { Sprint } from '@/core/domain/entities/sprint';
import { SprintId } from '@/core/domain/value-objects/identifier';
import { SprintStatus } from '@/core/domain/value-objects/status';
import { EntityNotFoundError } from '@/core/domain/errors/domain-error';

export interface UpdateSprintCommand {
  id: string;
  name?: string;
  goal?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export class UpdateSprintUseCase {
  constructor(
    private sprintRepository: SprintRepositoryPort,
    private eventBus: EventBusPort
  ) {}

  async execute(command: UpdateSprintCommand): Promise<Sprint> {
    const sprintId = SprintId.create(command.id);
    const sprint = await this.sprintRepository.findById(sprintId);

    if (!sprint) {
      throw new EntityNotFoundError('Sprint', command.id);
    }

    if (command.name !== undefined) {
      sprint.updateName(command.name);
    }

    if (command.goal !== undefined) {
      sprint.updateGoal(command.goal);
    }

    if (command.status) {
      const newStatus = SprintStatus.fromString(command.status);
      sprint.updateStatus(newStatus);
    }

    if (command.startDate !== undefined && command.endDate !== undefined) {
      sprint.setDates(command.startDate, command.endDate);
    }

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
