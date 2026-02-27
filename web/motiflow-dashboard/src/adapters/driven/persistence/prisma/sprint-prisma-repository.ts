import { PrismaClient } from '@prisma/client';
import { SprintRepositoryPort, SprintFilters } from '@/core/ports/repositories/sprint-repository.port';
import { Sprint } from '@/core/domain/entities/sprint';
import { SprintId } from '@/core/domain/value-objects/identifier';
import { SprintMapper } from '../mappers/sprint.mapper';
import { prisma } from '@/lib/prisma/client';

export class SprintPrismaRepository implements SprintRepositoryPort {
  constructor(private client: PrismaClient = prisma) {}

  async save(sprint: Sprint): Promise<Sprint> {
    const data = SprintMapper.toPersistence(sprint);
    
    // Save sprint
    const saved = await this.client.sprint.upsert({
      where: { id: sprint.id.getValue() },
      create: data,
      update: data,
      include: {
        stories: {
          include: {
            story: {
              include: {
                tasks: true,
                acceptanceCriteria: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    // Save sprint-story relationships
    const sprintStories = sprint.getStories();
    
    // Delete existing relationships
    await this.client.sprintStory.deleteMany({
      where: { sprintId: sprint.id.getValue() },
    });

    // Create new relationships
    for (let index = 0; index < sprintStories.length; index++) {
      const story = sprintStories[index];
      await this.client.sprintStory.create({
        data: {
          sprintId: sprint.id.getValue(),
          storyId: story.id.getValue(),
          order: index,
        },
      });
    }

    // Reload to get all relationships
    const reloaded = await this.findById(sprint.id);
    if (!reloaded) {
      throw new Error('Failed to reload sprint after save');
    }

    return reloaded;
  }

  async findById(id: SprintId): Promise<Sprint | null> {
    const sprint = await this.client.sprint.findUnique({
      where: { id: id.getValue() },
      include: {
        stories: {
          include: {
            story: {
              include: {
                tasks: true,
                acceptanceCriteria: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return sprint ? SprintMapper.toDomain(sprint) : null;
  }

  async findAll(filters?: SprintFilters): Promise<Sprint[]> {
    const where: {
      status?: string;
      startDate?: { gte?: Date; lte?: Date };
      endDate?: { gte?: Date; lte?: Date };
    } = {};
    
    if (filters?.status) {
      where.status = filters.status.getValue();
    }
    
    if (filters?.startDate) {
      where.startDate = { gte: filters.startDate };
    }
    
    if (filters?.endDate) {
      where.endDate = { lte: filters.endDate };
    }

    const sprints = await this.client.sprint.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        stories: {
          include: {
            story: {
              include: {
                tasks: true,
                acceptanceCriteria: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sprints.map(sprint => SprintMapper.toDomain(sprint));
  }

  async delete(id: SprintId): Promise<void> {
    await this.client.sprint.delete({
      where: { id: id.getValue() },
    });
  }

  async exists(id: SprintId): Promise<boolean> {
    const count = await this.client.sprint.count({
      where: { id: id.getValue() },
    });
    return count > 0;
  }
}
