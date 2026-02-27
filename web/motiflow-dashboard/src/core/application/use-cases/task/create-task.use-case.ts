import { TaskRepositoryPort } from '@/core/ports/repositories/task-repository.port';
import { StoryRepositoryPort } from '@/core/ports/repositories/story-repository.port';
import { EventBusPort } from '@/core/ports/event-bus.port';
import { Task } from '@/core/domain/entities/task';
import { StoryId } from '@/core/domain/value-objects/identifier';
import { Priority } from '@/core/domain/value-objects/priority';
import { EntityNotFoundError } from '@/core/domain/errors/domain-error';
import { TaskCreated } from '@/core/domain/events/task-created.event';

export interface CreateTaskCommand {
  title: string;
  description?: string;
  priority?: string;
  estimate?: number;
  assignee?: string;
  storyId?: string;
}

export class CreateTaskUseCase {
  constructor(
    private taskRepository: TaskRepositoryPort,
    private storyRepository: StoryRepositoryPort,
    private eventBus: EventBusPort
  ) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    // Create task
    const task = Task.create({
      title: command.title,
      description: command.description,
      priority: command.priority ? Priority.fromString(command.priority) : undefined,
      estimate: command.estimate,
      assignee: command.assignee,
    });

    // Link to story if provided
    let storyId: StoryId | null = null;
    if (command.storyId) {
      storyId = StoryId.create(command.storyId);
      const story = await this.storyRepository.findById(storyId);
      
      if (!story) {
        throw new EntityNotFoundError('Story', command.storyId);
      }

      task.linkToStory(storyId);
      story.addTask(task);
      await this.storyRepository.save(story);
    }

    // Update TaskCreated event with storyId
    const events = task.getDomainEvents();
    if (events.length > 0 && events[0] instanceof TaskCreated) {
      task.clearDomainEvents();
      task.addDomainEvent(new TaskCreated(task.id, task.getTitle(), storyId));
    }

    // Save task
    const savedTask = await this.taskRepository.save(task);

    // Publish events
    const domainEvents = savedTask.getDomainEvents();
    for (const event of domainEvents) {
      await this.eventBus.publish(event);
    }
    savedTask.clearDomainEvents();

    return savedTask;
  }
}
