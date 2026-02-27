import { TaskRepositoryPort } from '@/core/ports/repositories/task-repository.port';
import { StoryRepositoryPort } from '@/core/ports/repositories/story-repository.port';
import { EventBusPort } from '@/core/ports/event-bus.port';
import { Task } from '@/core/domain/entities/task';
import { TaskId, StoryId } from '@/core/domain/value-objects/identifier';
import { TaskStatus } from '@/core/domain/value-objects/status';
import { Priority } from '@/core/domain/value-objects/priority';
import { EntityNotFoundError } from '@/core/domain/errors/domain-error';
import { TaskUpdated } from '@/core/domain/events/task-updated.event';

export interface UpdateTaskCommand {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  estimate?: number;
  assignee?: string;
  storyId?: string;
}

export class UpdateTaskUseCase {
  constructor(
    private taskRepository: TaskRepositoryPort,
    private storyRepository: StoryRepositoryPort,
    private eventBus: EventBusPort
  ) {}

  async execute(command: UpdateTaskCommand): Promise<Task> {
    const taskId = TaskId.create(command.id);
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new EntityNotFoundError('Task', command.id);
    }

    if (command.title !== undefined) {
      task.updateTitle(command.title);
    }

    if (command.description !== undefined) {
      task.updateDescription(command.description);
    }

    if (command.status) {
      const newStatus = TaskStatus.fromString(command.status);
      task.updateStatus(newStatus);
    }

    if (command.priority) {
      const priority = Priority.fromString(command.priority);
      task.updatePriority(priority);
    }

    if (command.estimate !== undefined) {
      task.updateEstimate(command.estimate);
    }

    if (command.assignee !== undefined) {
      if (command.assignee && command.assignee.trim().length > 0) {
        task.assign(command.assignee);
      } else {
        task.unassign();
      }
    }

    // Handle story linking/unlinking
    if (command.storyId !== undefined) {
      if (command.storyId) {
        const storyId = StoryId.create(command.storyId);
        const story = await this.storyRepository.findById(storyId);
        
        if (!story) {
          throw new EntityNotFoundError('Story', command.storyId);
        }

        task.linkToStory(storyId);
      } else {
        task.unlinkFromStory();
      }
    }

    // Add update event before saving
    const changes: Record<string, any> = {};
    if (command.title !== undefined) changes.title = command.title;
    if (command.status !== undefined) changes.status = command.status;
    if (command.priority !== undefined) changes.priority = command.priority;
    
    if (Object.keys(changes).length > 0) {
      task.addDomainEvent(new TaskUpdated(task.id, changes));
    }

    const savedTask = await this.taskRepository.save(task);

    // Publish events
    const events = savedTask.getDomainEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    savedTask.clearDomainEvents();

    return savedTask;
  }
}
