import { EpicRepositoryPort } from '@/core/ports/repositories/epic-repository.port';
import { EventBusPort } from '@/core/ports/event-bus.port';
import { Epic } from '@/core/domain/entities/epic';
import { EpicId } from '@/core/domain/value-objects/identifier';
import { EpicStatus } from '@/core/domain/value-objects/status';
import { Priority } from '@/core/domain/value-objects/priority';
import { EntityNotFoundError } from '@/core/domain/errors/domain-error';

export interface UpdateEpicCommand {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
}

export class UpdateEpicUseCase {
  constructor(
    private epicRepository: EpicRepositoryPort,
    private eventBus: EventBusPort
  ) {}

  async execute(command: UpdateEpicCommand): Promise<Epic> {
    const epicId = EpicId.create(command.id);
    const epic = await this.epicRepository.findById(epicId);

    if (!epic) {
      throw new EntityNotFoundError('Epic', command.id);
    }

    if (command.title !== undefined) {
      epic.updateTitle(command.title);
    }

    if (command.description !== undefined) {
      epic.updateDescription(command.description);
    }

    if (command.status) {
      const newStatus = EpicStatus.fromString(command.status);
      epic.updateStatus(newStatus);
    }

    if (command.priority) {
      const priority = Priority.fromString(command.priority);
      epic.updatePriority(priority);
    }

    const savedEpic = await this.epicRepository.save(epic);

    // Publish events
    const events = savedEpic.getDomainEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    savedEpic.clearDomainEvents();

    return savedEpic;
  }
}
