import { SprintRepositoryPort } from '@/core/ports/repositories/sprint-repository.port';
import { SprintId } from '@/core/domain/value-objects/identifier';
import { EntityNotFoundError } from '@/core/domain/errors/domain-error';

export interface DeleteSprintCommand {
  id: string;
}

export class DeleteSprintUseCase {
  constructor(
    private sprintRepository: SprintRepositoryPort
  ) {}

  async execute(command: DeleteSprintCommand): Promise<void> {
    const sprintId = SprintId.create(command.id);
    const sprint = await this.sprintRepository.findById(sprintId);

    if (!sprint) {
      throw new EntityNotFoundError('Sprint', command.id);
    }

    await this.sprintRepository.delete(sprintId);
  }
}
