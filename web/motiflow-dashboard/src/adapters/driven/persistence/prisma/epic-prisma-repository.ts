import { PrismaClient } from '@prisma/client';
import { EpicRepositoryPort, EpicFilters } from '@/core/ports/repositories/epic-repository.port';
import { Epic } from '@/core/domain/entities/epic';
import { EpicId } from '@/core/domain/value-objects/identifier';
import { EpicMapper } from '../mappers/epic.mapper';
import { prisma } from '@/lib/prisma/client';

export class EpicPrismaRepository implements EpicRepositoryPort {
  constructor(private client: PrismaClient = prisma) {}

  async save(epic: Epic): Promise<Epic> {
    const data = EpicMapper.toPersistence(epic);
    
    // Save epic
    const saved = await this.client.epic.upsert({
      where: { id: epic.id.getValue() },
      create: data,
      update: data,
      include: {
        stories: {
          include: {
            tasks: true,
            acceptanceCriteria: true,
          },
        },
      },
    });

    // Save stories and tasks
    const stories = epic.getStories();
    for (const story of stories) {
      const storyData = {
        id: story.id.getValue(),
        title: story.getTitle(),
        description: story.getDescription() || null,
        as: story.getAs(),
        iWant: story.getIWant(),
        soThat: story.getSoThat(),
        storyPoints: story.getStoryPoints()?.getValue() || null,
        status: story.getStatus().getValue(),
        priority: story.getPriority().getValue(),
        epicId: epic.id.getValue(),
        createdAt: story.createdAt,
        updatedAt: story.getUpdatedAt(),
      };

      await this.client.story.upsert({
        where: { id: story.id.getValue() },
        create: storyData,
        update: storyData,
      });

      // Save acceptance criteria
      // First, delete existing criteria for this story
      await this.client.acceptanceCriteria.deleteMany({
        where: { storyId: story.id.getValue() },
      });
      
      // Then create new ones
      const criteria = story.getAcceptanceCriteria();
      for (const ac of criteria) {
        await this.client.acceptanceCriteria.create({
          data: {
            description: ac.getDescription(),
            testable: ac.isTestable(),
            satisfied: ac.isSatisfied(),
            order: ac.getOrder(),
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
    }

    // Reload with all relations
    const reloaded = await this.findById(epic.id);
    if (!reloaded) {
      throw new Error('Failed to reload epic after save');
    }

    return reloaded;
  }

  async findById(id: EpicId): Promise<Epic | null> {
    const epic = await this.client.epic.findUnique({
      where: { id: id.getValue() },
      include: {
        stories: {
          include: {
            tasks: true,
            acceptanceCriteria: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return epic ? EpicMapper.toDomain(epic) : null;
  }

  async findAll(filters?: EpicFilters): Promise<Epic[]> {
    const where: {
      status?: string;
      priority?: string;
    } = {};
    
    if (filters?.status) {
      where.status = filters.status.getValue();
    }
    
    if (filters?.priority) {
      where.priority = filters.priority.getValue();
    }

    const epics = await this.client.epic.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        stories: {
          include: {
            tasks: true,
            acceptanceCriteria: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return epics.map(epic => EpicMapper.toDomain(epic));
  }

  async delete(id: EpicId): Promise<void> {
    await this.client.epic.delete({
      where: { id: id.getValue() },
    });
  }

  async exists(id: EpicId): Promise<boolean> {
    const count = await this.client.epic.count({
      where: { id: id.getValue() },
    });
    return count > 0;
  }
}
