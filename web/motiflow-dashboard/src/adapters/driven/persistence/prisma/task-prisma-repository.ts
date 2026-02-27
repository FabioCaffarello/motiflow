import { PrismaClient } from '@prisma/client';
import { TaskRepositoryPort, TaskFilters } from '@/core/ports/repositories/task-repository.port';
import { Task } from '@/core/domain/entities/task';
import { TaskId, StoryId } from '@/core/domain/value-objects/identifier';
import { TaskMapper } from '../mappers/task.mapper';
import { prisma } from '@/lib/prisma/client';

export class TaskPrismaRepository implements TaskRepositoryPort {
  constructor(private client: PrismaClient = prisma) {}

  async save(task: Task): Promise<Task> {
    const data = TaskMapper.toPersistence(task);
    
    const saved = await this.client.task.upsert({
      where: { id: task.id.getValue() },
      create: data,
      update: data,
    });

    return TaskMapper.toDomain(saved);
  }

  async findById(id: TaskId): Promise<Task | null> {
    const task = await this.client.task.findUnique({
      where: { id: id.getValue() },
    });

    return task ? TaskMapper.toDomain(task) : null;
  }

  async findByStoryId(storyId: StoryId): Promise<Task[]> {
    const tasks = await this.client.task.findMany({
      where: { storyId: storyId.getValue() },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map(task => TaskMapper.toDomain(task));
  }

  async findAll(filters?: TaskFilters): Promise<Task[]> {
    const where: {
      storyId?: string;
      status?: string;
      priority?: string;
      assignee?: string;
    } = {};
    
    if (filters?.storyId) {
      where.storyId = filters.storyId.getValue();
    }
    
    if (filters?.status) {
      where.status = filters.status.getValue();
    }
    
    if (filters?.priority) {
      where.priority = filters.priority.getValue();
    }

    if (filters?.assignee) {
      where.assignee = filters.assignee;
    }

    const tasks = await this.client.task.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map(task => TaskMapper.toDomain(task));
  }

  async delete(id: TaskId): Promise<void> {
    await this.client.task.delete({
      where: { id: id.getValue() },
    });
  }

  async exists(id: TaskId): Promise<boolean> {
    const count = await this.client.task.count({
      where: { id: id.getValue() },
    });
    return count > 0;
  }
}
