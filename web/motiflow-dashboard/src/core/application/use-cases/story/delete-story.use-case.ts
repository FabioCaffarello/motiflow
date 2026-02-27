import { StoryRepositoryPort } from '@/core/ports/repositories/story-repository.port';
import { StoryId } from '@/core/domain/value-objects/identifier';
import { EntityNotFoundError } from '@/core/domain/errors/domain-error';

export interface DeleteStoryCommand {
  id: string;
}

export class DeleteStoryUseCase {
  constructor(
    private storyRepository: StoryRepositoryPort
  ) {}

  async execute(command: DeleteStoryCommand): Promise<void> {
    const storyId = StoryId.create(command.id);
    const story = await this.storyRepository.findById(storyId);

    if (!story) {
      throw new EntityNotFoundError('Story', command.id);
    }

    await this.storyRepository.delete(storyId);
  }
}
