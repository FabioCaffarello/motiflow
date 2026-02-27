import { StoryRepositoryPort } from '@/core/ports/repositories/story-repository.port';
import { EpicRepositoryPort } from '@/core/ports/repositories/epic-repository.port';
import { EventBusPort } from '@/core/ports/event-bus.port';
import { Story } from '@/core/domain/entities/story';
import { StoryId, EpicId } from '@/core/domain/value-objects/identifier';
import { StoryStatus } from '@/core/domain/value-objects/status';
import { Priority } from '@/core/domain/value-objects/priority';
import { StoryPoints } from '@/core/domain/value-objects/story-points';
import { AcceptanceCriteria } from '@/core/domain/value-objects/acceptance-criteria';
import { EntityNotFoundError } from '@/core/domain/errors/domain-error';
import { StoryUpdated } from '@/core/domain/events/story-updated.event';

export interface UpdateStoryCommand {
  id: string;
  title?: string;
  description?: string;
  as?: string;
  iWant?: string;
  soThat?: string;
  acceptanceCriteria?: string[];
  storyPoints?: number;
  status?: string;
  priority?: string;
  epicId?: string;
}

export class UpdateStoryUseCase {
  constructor(
    private storyRepository: StoryRepositoryPort,
    private epicRepository: EpicRepositoryPort,
    private eventBus: EventBusPort
  ) {}

  async execute(command: UpdateStoryCommand): Promise<Story> {
    const storyId = StoryId.create(command.id);
    const story = await this.storyRepository.findById(storyId);

    if (!story) {
      throw new EntityNotFoundError('Story', command.id);
    }

    if (command.title !== undefined) {
      story.updateTitle(command.title);
    }

    if (command.description !== undefined) {
      story.updateDescription(command.description);
    }

    if (command.as !== undefined) {
      story.updateAs(command.as);
    }

    if (command.iWant !== undefined) {
      story.updateIWant(command.iWant);
    }

    if (command.soThat !== undefined) {
      story.updateSoThat(command.soThat);
    }

    if (command.acceptanceCriteria !== undefined) {
      // Only update if there are criteria, otherwise leave as is
      // (The entity requires at least one, so we only update if provided)
      if (command.acceptanceCriteria.length > 0) {
        const acceptanceCriteria = command.acceptanceCriteria.map(
          (desc, index) => new AcceptanceCriteria(desc, true, false, index)
        );
        story.updateAcceptanceCriteria(acceptanceCriteria);
      }
    }

    if (command.storyPoints !== undefined) {
      const storyPoints = command.storyPoints 
        ? StoryPoints.create(command.storyPoints) 
        : null;
      story.updateStoryPoints(storyPoints);
    }

    if (command.status) {
      const newStatus = StoryStatus.fromString(command.status);
      story.updateStatus(newStatus);
    }

    if (command.priority) {
      const priority = Priority.fromString(command.priority);
      story.updatePriority(priority);
    }

    // Handle epic linking/unlinking
    if (command.epicId !== undefined) {
      if (command.epicId) {
        const epicId = EpicId.create(command.epicId);
        const epic = await this.epicRepository.findById(epicId);
        
        if (!epic) {
          throw new EntityNotFoundError('Epic', command.epicId);
        }

        story.linkToEpic(epicId);
      } else {
        story.unlinkFromEpic();
      }
    }

    // Add update event before saving
    const changes: Record<string, any> = {};
    if (command.title !== undefined) changes.title = command.title;
    if (command.status !== undefined) changes.status = command.status;
    if (command.priority !== undefined) changes.priority = command.priority;
    
    if (Object.keys(changes).length > 0) {
      story.addDomainEvent(new StoryUpdated(story.id, changes));
    }

    const savedStory = await this.storyRepository.save(story);

    // Publish events
    const events = savedStory.getDomainEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    savedStory.clearDomainEvents();

    return savedStory;
  }
}
