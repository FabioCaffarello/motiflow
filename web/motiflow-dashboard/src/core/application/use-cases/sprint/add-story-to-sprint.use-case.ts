import { SprintRepositoryPort } from '@/core/ports/repositories/sprint-repository.port';
import { StoryRepositoryPort } from '@/core/ports/repositories/story-repository.port';
import { SprintId, StoryId } from '@/core/domain/value-objects/identifier';
import { EntityNotFoundError } from '@/core/domain/errors/domain-error';
import { SprintPlanningService } from '@/core/domain/services/sprint-planning.service';

export interface AddStoryToSprintCommand {
  sprintId: string;
  storyId: string;
  order?: number;
}

export class AddStoryToSprintUseCase {
  constructor(
    private sprintRepository: SprintRepositoryPort,
    private storyRepository: StoryRepositoryPort
  ) {}

  async execute(command: AddStoryToSprintCommand): Promise<void> {
    const sprintId = SprintId.create(command.sprintId);
    const storyId = StoryId.create(command.storyId);

    const sprint = await this.sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new EntityNotFoundError('Sprint', command.sprintId);
    }

    const story = await this.storyRepository.findById(storyId);
    if (!story) {
      throw new EntityNotFoundError('Story', command.storyId);
    }

    // Validate using SprintPlanningService
    const planningService = new SprintPlanningService();
    const canAdd = planningService.canAddStoryToSprint(
      sprint.getStories(),
      story
    );

    if (!canAdd) {
      throw new Error('Cannot add story to sprint: capacity limit reached');
    }

    sprint.addStory(story, command.order);
    await this.sprintRepository.save(sprint);
  }
}
