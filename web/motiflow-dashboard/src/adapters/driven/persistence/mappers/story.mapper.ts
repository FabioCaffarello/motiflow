import { Story } from '@/core/domain/entities/story';
import { Story as PrismaStory, Task as PrismaTask, AcceptanceCriteria as PrismaAcceptanceCriteria } from '@prisma/client';
import { StoryId, EpicId } from '@/core/domain/value-objects/identifier';
import { StoryStatus } from '@/core/domain/value-objects/status';
import { Priority } from '@/core/domain/value-objects/priority';
import { StoryPoints } from '@/core/domain/value-objects/story-points';
import { AcceptanceCriteria } from '@/core/domain/value-objects/acceptance-criteria';
import { TaskMapper } from './task.mapper';

type PrismaStoryWithRelations = PrismaStory & {
  tasks?: PrismaTask[];
  acceptanceCriteria?: PrismaAcceptanceCriteria[];
};

export class StoryMapper {
  static toDomain(prismaStory: PrismaStoryWithRelations): Story {
    return Story.reconstitute({
      id: StoryId.create(prismaStory.id),
      title: prismaStory.title,
      description: prismaStory.description || undefined,
      as: prismaStory.as,
      iWant: prismaStory.iWant,
      soThat: prismaStory.soThat,
      acceptanceCriteria: prismaStory.acceptanceCriteria?.map(ac => 
        new AcceptanceCriteria(ac.description, ac.testable, ac.satisfied, ac.order)
      ) || [],
      storyPoints: StoryPoints.fromNumber(prismaStory.storyPoints),
      status: StoryStatus.fromString(prismaStory.status),
      priority: Priority.fromString(prismaStory.priority),
      tasks: prismaStory.tasks?.map(task => TaskMapper.toDomain(task)) || [],
      epicId: prismaStory.epicId ? EpicId.create(prismaStory.epicId) : null,
      createdAt: prismaStory.createdAt,
      updatedAt: prismaStory.updatedAt,
    });
  }

  static toPersistence(story: Story) {
    return {
      id: story.id.getValue(),
      title: story.getTitle(),
      description: story.getDescription() || null,
      as: story.getAs(),
      iWant: story.getIWant(),
      soThat: story.getSoThat(),
      storyPoints: story.getStoryPoints()?.getValue() || null,
      status: story.getStatus().getValue(),
      priority: story.getPriority().getValue(),
      epicId: story.getEpicId()?.getValue() || null,
      createdAt: story.createdAt,
      updatedAt: story.getUpdatedAt(),
      acceptanceCriteria: story.getAcceptanceCriteria().map((ac, index) => ({
        description: ac.getDescription(),
        testable: ac.isTestable(),
        satisfied: ac.isSatisfied(),
        order: ac.getOrder() || index,
      })),
    };
  }
}
