import { StoryRepositoryPort } from '@/core/ports/repositories/story-repository.port';
import { EpicRepositoryPort } from '@/core/ports/repositories/epic-repository.port';
import { StoryId, EpicId } from '@/core/domain/value-objects/identifier';
import { EntityNotFoundError } from '@/core/domain/errors/domain-error';

export interface LinkStoryToEpicCommand {
  storyId: string;
  epicId: string;
}

export class LinkStoryToEpicUseCase {
  constructor(
    private storyRepository: StoryRepositoryPort,
    private epicRepository: EpicRepositoryPort
  ) {}

  async execute(command: LinkStoryToEpicCommand): Promise<void> {
    const storyId = StoryId.create(command.storyId);
    const epicId = EpicId.create(command.epicId);

    const story = await this.storyRepository.findById(storyId);
    if (!story) {
      throw new EntityNotFoundError('Story', command.storyId);
    }

    const epic = await this.epicRepository.findById(epicId);
    if (!epic) {
      throw new EntityNotFoundError('Epic', command.epicId);
    }

    // Link story to epic
    story.linkToEpic(epicId);
    await this.storyRepository.save(story);

    // Add story to epic
    epic.addStory(story);
    await this.epicRepository.save(epic);
  }
}
