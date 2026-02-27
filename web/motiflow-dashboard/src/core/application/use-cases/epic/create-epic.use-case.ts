import { EpicRepositoryPort } from '@/core/ports/repositories/epic-repository.port';
import { EventBusPort } from '@/core/ports/event-bus.port';
import { Epic } from '@/core/domain/entities/epic';
import { EpicId } from '@/core/domain/value-objects/identifier';
import { Priority } from '@/core/domain/value-objects/priority';

export interface CreateEpicCommand {
  title: string;
  description?: string;
  priority?: string;
}

export class CreateEpicUseCase {
  constructor(
    private epicRepository: EpicRepositoryPort,
    private eventBus: EventBusPort
  ) {}

  async execute(command: CreateEpicCommand): Promise<Epic> {
    // 1. Validar command
    if (!command.title || command.title.trim().length === 0) {
      throw new Error('Title is required');
    }

    // 2. Criar Epic
    const priority = command.priority ? Priority.fromString(command.priority) : undefined;
    const epic = Epic.create({
      title: command.title,
      description: command.description,
      priority,
    });

    // 3. Salvar no repositório
    const savedEpic = await this.epicRepository.save(epic);

    // 4. Publicar eventos
    const events = savedEpic.getDomainEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    savedEpic.clearDomainEvents();

    // 5. Retornar Epic
    return savedEpic;
  }
}
