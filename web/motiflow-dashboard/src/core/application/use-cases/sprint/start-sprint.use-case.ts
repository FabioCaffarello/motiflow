import { SprintRepositoryPort } from '@/core/ports/repositories/sprint-repository.port';
import { EventBusPort } from '@/core/ports/event-bus.port';
import { Sprint } from '@/core/domain/entities/sprint';
import { SprintId } from '@/core/domain/value-objects/identifier';
import { EntityNotFoundError } from '@/core/domain/errors/domain-error';

export interface StartSprintCommand {
  id: string;
}

export class StartSprintUseCase {
  constructor(
    private sprintRepository: SprintRepositoryPort,
    private eventBus: EventBusPort
  ) {}

  async execute(command: StartSprintCommand): Promise<Sprint> {
    const sprintId = SprintId.create(command.id);
    const sprint = await this.sprintRepository.findById(sprintId);

    if (!sprint) {
      throw new EntityNotFoundError('Sprint', command.id);
    }

    sprint.start();

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
