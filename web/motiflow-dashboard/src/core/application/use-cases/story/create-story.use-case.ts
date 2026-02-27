import { StoryRepositoryPort } from '@/core/ports/repositories/story-repository.port';
import { EpicRepositoryPort } from '@/core/ports/repositories/epic-repository.port';
import { EventBusPort } from '@/core/ports/event-bus.port';
import { Story } from '@/core/domain/entities/story';
import { EpicId } from '@/core/domain/value-objects/identifier';
import { Priority } from '@/core/domain/value-objects/priority';
import { StoryPoints } from '@/core/domain/value-objects/story-points';
import { AcceptanceCriteria } from '@/core/domain/value-objects/acceptance-criteria';
import { EntityNotFoundError } from '@/core/domain/errors/domain-error';
import { StoryCreated } from '@/core/domain/events/story-created.event';

export interface CreateStoryCommand {
  title: string;
  description?: string;
  as: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria?: string[];
  storyPoints?: number;
  priority?: string;
  epicId?: string;
}

export class CreateStoryUseCase {
  constructor(
    private storyRepository: StoryRepositoryPort,
    private epicRepository: EpicRepositoryPort,
    private eventBus: EventBusPort
  ) {}

  async execute(command: CreateStoryCommand): Promise<Story> {
    // Validate user story format
    if (!command.as || !command.iWant || !command.soThat) {
      throw new Error('User story must have "as", "iWant", and "soThat" fields');
    }

    // Create acceptance criteria
    const acceptanceCriteria = (command.acceptanceCriteria || []).map(
      (desc, index) => new AcceptanceCriteria(desc, true, false, index)
    );

    // Create story
    const story = Story.create({
      title: command.title,
      description: command.description,
      as: command.as,
      iWant: command.iWant,
      soThat: command.soThat,
      acceptanceCriteria: acceptanceCriteria.length > 0 ? acceptanceCriteria : undefined,
      storyPoints: command.storyPoints ? StoryPoints.create(command.storyPoints) : undefined,
      priority: command.priority ? Priority.fromString(command.priority) : undefined,
    });

    // Link to epic if provided
    let epicId: EpicId | null = null;
    if (command.epicId) {
      epicId = EpicId.create(command.epicId);
      const epic = await this.epicRepository.findById(epicId);
      
      if (!epic) {
        throw new EntityNotFoundError('Epic', command.epicId);
      }

      story.linkToEpic(epicId);
    }

    // Update StoryCreated event with epicId if linked to epic
    if (epicId) {
      const initialEvents = story.getDomainEvents();
      if (initialEvents.length > 0 && initialEvents[0] instanceof StoryCreated) {
        story.clearDomainEvents();
        story.addDomainEvent(new StoryCreated(story.id, story.getTitle(), epicId));
      }
    }

    // Save story
    const savedStory = await this.storyRepository.save(story);

    // If linked to epic, update epic
    if (command.epicId) {
      const epicIdForUpdate = EpicId.create(command.epicId);
      const epic = await this.epicRepository.findById(epicIdForUpdate);
      if (epic) {
        epic.addStory(savedStory);
        await this.epicRepository.save(epic);
      }
    }

    // Publish events
    const domainEvents = savedStory.getDomainEvents();
    for (const event of domainEvents) {
      await this.eventBus.publish(event);
    }
    savedStory.clearDomainEvents();

    return savedStory;
  }
}
