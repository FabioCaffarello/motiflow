import { TaskRepositoryPort } from '@/core/ports/repositories/task-repository.port';
import { TaskId } from '@/core/domain/value-objects/identifier';
import { EntityNotFoundError } from '@/core/domain/errors/domain-error';

export interface DeleteTaskCommand {
  id: string;
}

export class DeleteTaskUseCase {
  constructor(
    private taskRepository: TaskRepositoryPort
  ) {}

  async execute(command: DeleteTaskCommand): Promise<void> {
    const taskId = TaskId.create(command.id);
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new EntityNotFoundError('Task', command.id);
    }

    await this.taskRepository.delete(taskId);
  }
}
