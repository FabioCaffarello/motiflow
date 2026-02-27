import { Sprint } from '@/core/domain/entities/sprint';
import { Sprint as PrismaSprint, SprintStory as PrismaSprintStory, Story as PrismaStory } from '@prisma/client';
import { SprintId } from '@/core/domain/value-objects/identifier';
import { SprintStatus } from '@/core/domain/value-objects/status';
import { StoryMapper } from './story.mapper';

type PrismaSprintWithRelations = PrismaSprint & {
  stories?: (PrismaSprintStory & {
    story?: PrismaStory;
  })[];
};

export class SprintMapper {
  static toDomain(prismaSprint: PrismaSprintWithRelations): Sprint {
    // Map sprint stories to domain stories
    const stories = prismaSprint.stories
      ?.map(sprintStory => sprintStory.story ? StoryMapper.toDomain(sprintStory.story) : null)
      .filter((story): story is NonNullable<typeof story> => story !== null) || [];

    return Sprint.reconstitute({
      id: SprintId.create(prismaSprint.id),
      name: prismaSprint.name,
      goal: prismaSprint.goal || undefined,
      status: SprintStatus.fromString(prismaSprint.status),
      startDate: prismaSprint.startDate,
      endDate: prismaSprint.endDate,
      stories,
      createdAt: prismaSprint.createdAt,
      updatedAt: prismaSprint.updatedAt,
    });
  }

  static toPersistence(sprint: Sprint) {
    return {
      id: sprint.id.getValue(),
      name: sprint.getName(),
      goal: sprint.getGoal() || null,
      status: sprint.getStatus().getValue(),
      startDate: sprint.getStartDate(),
      endDate: sprint.getEndDate(),
      createdAt: sprint.createdAt,
      updatedAt: sprint.getUpdatedAt(),
    };
  }
}
