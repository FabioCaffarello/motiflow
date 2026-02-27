import { Sprint } from '../../domain/entities/sprint';
import { StoryDto } from './story.dto';

export interface SprintDto {
  id: string;
  name: string;
  goal: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  stories: StoryDto[];
  createdAt: string;
  updatedAt: string;
}

import { StoryDtoMapper } from './story.dto';

export class SprintDtoMapper {
  static toDto(sprint: Sprint): SprintDto {
    return {
      id: sprint.id.getValue(),
      name: sprint.getName(),
      goal: sprint.getGoal() || null,
      status: sprint.getStatus().getValue(),
      startDate: sprint.getStartDate()?.toISOString() || null,
      endDate: sprint.getEndDate()?.toISOString() || null,
      stories: sprint.getStories().map(story => {
        // Convert Story entity to StoryDto manually
        return {
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
        };
      }),
      createdAt: sprint.createdAt.toISOString(),
      updatedAt: sprint.getUpdatedAt().toISOString(),
    };
  }
}
