import { PrismaClient } from '@prisma/client';
import { StoryRepositoryPort, StoryFilters } from '@/core/ports/repositories/story-repository.port';
import { Story } from '@/core/domain/entities/story';
import { StoryId, EpicId } from '@/core/domain/value-objects/identifier';
import { StoryMapper } from '../mappers/story.mapper';
import { prisma } from '@/lib/prisma/client';

export class StoryPrismaRepository implements StoryRepositoryPort {
  constructor(private client: PrismaClient = prisma) {}

  async save(story: Story): Promise<Story> {
    const data = StoryMapper.toPersistence(story);
    
    // Save story
    const saved = await this.client.story.upsert({
      where: { id: story.id.getValue() },
      create: {
        id: data.id,
        title: data.title,
        description: data.description,
        as: data.as,
        iWant: data.iWant,
        soThat: data.soThat,
        storyPoints: data.storyPoints,
        status: data.status,
        priority: data.priority,
        epicId: data.epicId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      update: {
        title: data.title,
        description: data.description,
        as: data.as,
        iWant: data.iWant,
        soThat: data.soThat,
        storyPoints: data.storyPoints,
        status: data.status,
        priority: data.priority,
        epicId: data.epicId,
        updatedAt: data.updatedAt,
      },
      include: {
        tasks: true,
        acceptanceCriteria: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Save acceptance criteria
    await this.client.acceptanceCriteria.deleteMany({
      where: { storyId: story.id.getValue() },
    });

    for (const ac of data.acceptanceCriteria) {
      await this.client.acceptanceCriteria.create({
        data: {
          description: ac.description,
          testable: ac.testable,
          satisfied: ac.satisfied,
          order: ac.order,
          storyId: story.id.getValue(),
        },
      });
    }

    // Save tasks
    const tasks = story.getTasks();
    for (const task of tasks) {
      const taskData = {
        id: task.id.getValue(),
        title: task.getTitle(),
        description: task.getDescription() || null,
        status: task.getStatus().getValue(),
        priority: task.getPriority().getValue(),
        estimate: task.getEstimate(),
        assignee: task.getAssignee() || null,
        storyId: story.id.getValue(),
        createdAt: task.createdAt,
        updatedAt: task.getUpdatedAt(),
      };

      await this.client.task.upsert({
        where: { id: task.id.getValue() },
        create: taskData,
        update: taskData,
      });
    }

    // Reload with all relations
    const reloaded = await this.findById(story.id);
    if (!reloaded) {
      throw new Error('Failed to reload story after save');
    }

    return reloaded;
  }

  async findById(id: StoryId): Promise<Story | null> {
    const story = await this.client.story.findUnique({
      where: { id: id.getValue() },
      include: {
        tasks: true,
        acceptanceCriteria: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return story ? StoryMapper.toDomain(story) : null;
  }

  async findByEpicId(epicId: EpicId): Promise<Story[]> {
    const stories = await this.client.story.findMany({
      where: { epicId: epicId.getValue() },
      include: {
        tasks: true,
        acceptanceCriteria: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return stories.map(story => StoryMapper.toDomain(story));
  }

  async findAll(filters?: StoryFilters): Promise<Story[]> {
    const where: {
      epicId?: string;
      status?: string;
      priority?: string;
    } = {};
    
    if (filters?.epicId) {
      where.epicId = filters.epicId.getValue();
    }
    
    if (filters?.status) {
      where.status = filters.status.getValue();
    }
    
    if (filters?.priority) {
      where.priority = filters.priority.getValue();
    }

    const stories = await this.client.story.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        tasks: true,
        acceptanceCriteria: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return stories.map(story => StoryMapper.toDomain(story));
  }

  async delete(id: StoryId): Promise<void> {
    await this.client.story.delete({
      where: { id: id.getValue() },
    });
  }

  async exists(id: StoryId): Promise<boolean> {
    const count = await this.client.story.count({
      where: { id: id.getValue() },
    });
    return count > 0;
  }
}
