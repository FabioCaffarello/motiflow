import { SprintRepositoryPort } from '@/core/ports/repositories/sprint-repository.port';
import { SprintId, StoryId } from '@/core/domain/value-objects/identifier';
import { EntityNotFoundError } from '@/core/domain/errors/domain-error';

export interface RemoveStoryFromSprintCommand {
  sprintId: string;
  storyId: string;
}

export class RemoveStoryFromSprintUseCase {
  constructor(
    private sprintRepository: SprintRepositoryPort
  ) {}

  async execute(command: RemoveStoryFromSprintCommand): Promise<void> {
    const sprintId = SprintId.create(command.sprintId);
    const storyId = StoryId.create(command.storyId);

    const sprint = await this.sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new EntityNotFoundError('Sprint', command.sprintId);
    }

    sprint.removeStory(storyId);
    await this.sprintRepository.save(sprint);
  }
}
