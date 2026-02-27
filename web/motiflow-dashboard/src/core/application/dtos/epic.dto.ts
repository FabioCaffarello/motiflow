import { Epic } from '@/core/domain/entities/epic';
import { StoryDto } from './story.dto';

export interface EpicDto {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  stories: StoryDto[];
  createdAt: string;
  updatedAt: string;
}

export class EpicDtoMapper {
  static toDto(epic: Epic): EpicDto {
    return {
      id: epic.id.getValue(),
      title: epic.getTitle(),
      description: epic.getDescription(),
      status: epic.getStatus().getValue(),
      priority: epic.getPriority().getValue(),
      stories: epic.getStories().map(story => ({
        id: story.id.getValue(),
        title: story.getTitle(),
        description: story.getDescription(),
        as: story.getAs(),
        iWant: story.getIWant(),
        soThat: story.getSoThat(),
        storyPoints: story.getStoryPoints()?.getValue() || null,
        status: story.getStatus().getValue(),
        priority: story.getPriority().getValue(),
        epicId: story.getEpicId()?.getValue() || null,
        createdAt: story.createdAt.toISOString(),
        updatedAt: story.getUpdatedAt().toISOString(),
      })),
      createdAt: epic.createdAt.toISOString(),
      updatedAt: epic.getUpdatedAt().toISOString(),
    };
  }
}
