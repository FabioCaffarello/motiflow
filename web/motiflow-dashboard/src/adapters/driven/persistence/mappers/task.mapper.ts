import { Task } from '@/core/domain/entities/task';
import { Task as PrismaTask } from '@prisma/client';
import { TaskId, StoryId } from '@/core/domain/value-objects/identifier';
import { TaskStatus } from '@/core/domain/value-objects/status';
import { Priority } from '@/core/domain/value-objects/priority';

export class TaskMapper {
  static toDomain(prismaTask: PrismaTask): Task {
    return Task.reconstitute({
      id: TaskId.create(prismaTask.id),
      title: prismaTask.title,
      description: prismaTask.description || undefined,
      status: TaskStatus.fromString(prismaTask.status),
      priority: Priority.fromString(prismaTask.priority),
      estimate: prismaTask.estimate,
      assignee: prismaTask.assignee || null,
      storyId: prismaTask.storyId ? StoryId.create(prismaTask.storyId) : null,
      createdAt: prismaTask.createdAt,
      updatedAt: prismaTask.updatedAt,
    });
  }

  static toPersistence(task: Task) {
    return {
      id: task.id.getValue(),
      title: task.getTitle(),
      description: task.getDescription() || null,
      status: task.getStatus().getValue(),
      priority: task.getPriority().getValue(),
      estimate: task.getEstimate(),
      assignee: task.getAssignee() || null,
      storyId: task.getStoryId()?.getValue() || null,
      createdAt: task.createdAt,
      updatedAt: task.getUpdatedAt(),
    };
  }
}
