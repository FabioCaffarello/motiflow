import { Epic } from '@/core/domain/entities/epic';
import { Epic as PrismaEpic, Story as PrismaStory, Task as PrismaTask, AcceptanceCriteria as PrismaAcceptanceCriteria } from '@prisma/client';
import { EpicId } from '@/core/domain/value-objects/identifier';
import { EpicStatus } from '@/core/domain/value-objects/status';
import { Priority } from '@/core/domain/value-objects/priority';
import { StoryMapper } from './story.mapper';

type PrismaEpicWithRelations = PrismaEpic & {
  stories?: (PrismaStory & {
    tasks?: PrismaTask[];
    acceptanceCriteria?: PrismaAcceptanceCriteria[];
  })[];
};

export class EpicMapper {
  static toDomain(prismaEpic: PrismaEpicWithRelations): Epic {
    return Epic.reconstitute({
      id: EpicId.create(prismaEpic.id),
      title: prismaEpic.title,
      description: prismaEpic.description || undefined,
      status: EpicStatus.fromString(prismaEpic.status),
      priority: Priority.fromString(prismaEpic.priority),
      stories: prismaEpic.stories?.map(story => StoryMapper.toDomain(story)) || [],
      createdAt: prismaEpic.createdAt,
      updatedAt: prismaEpic.updatedAt,
    });
  }

  static toPersistence(epic: Epic) {
    return {
      id: epic.id.getValue(),
      title: epic.getTitle(),
      description: epic.getDescription() || null,
      status: epic.getStatus().getValue(),
      priority: epic.getPriority().getValue(),
      createdAt: epic.createdAt,
      updatedAt: epic.getUpdatedAt(),
    };
  }
}
