'use server';

import { revalidatePath } from 'next/cache';
import { CreateStoryUseCase } from '@/core/application/use-cases/story/create-story.use-case';
import { LinkStoryToEpicUseCase } from '@/core/application/use-cases/story/link-story-to-epic.use-case';
import { UpdateStoryUseCase } from '@/core/application/use-cases/story/update-story.use-case';
import { DeleteStoryUseCase } from '@/core/application/use-cases/story/delete-story.use-case';
import { StoryPrismaRepository } from '@/adapters/driven/persistence/prisma/story-prisma-repository';
import { EpicPrismaRepository } from '@/adapters/driven/persistence/prisma/epic-prisma-repository';
import { EventBusAdapter } from '@/adapters/driven/events/event-bus.adapter';
import { StoryDto } from '@/core/application/dtos/story.dto';
import { StoryId, EpicId } from '@/core/domain/value-objects/identifier';
import { StoryStatus } from '@/core/domain/value-objects/status';
import { Priority } from '@/core/domain/value-objects/priority';
import { ActionResult, success, failure } from './types';

// Helper to convert Story to DTO
function storyToDto(story: any): StoryDto {
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
}

/**
 * Create a new story
 */
export async function createStory(
  title: string,
  as: string,
  iWant: string,
  soThat: string,
  description?: string,
  acceptanceCriteria?: string[],
  storyPoints?: number,
  priority?: string,
  epicId?: string
): Promise<ActionResult<StoryDto>> {
  try {
    const storyRepository = new StoryPrismaRepository();
    const epicRepository = new EpicPrismaRepository();
    const eventBus = new EventBusAdapter();
    const useCase = new CreateStoryUseCase(storyRepository, epicRepository, eventBus);
    
    const story = await useCase.execute({
      title,
      description,
      as,
      iWant,
      soThat,
      acceptanceCriteria,
      storyPoints,
      priority,
      epicId,
    });
    
    revalidatePath('/stories');
    if (epicId) {
      revalidatePath(`/epics/${epicId}`);
    }
    revalidatePath('/');
    
    return success(storyToDto(story));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to create story'
    );
  }
}

/**
 * List all stories with optional filters, pagination, and sorting
 */
export async function listStories(
  options?: {
    filters?: { epicId?: string; status?: string; priority?: string };
    pagination?: { page?: number; pageSize?: number };
    sorting?: { sortBy?: string; sortOrder?: 'asc' | 'desc' };
  }
): Promise<ActionResult<{
  stories: StoryDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>> {
  try {
    const repository = new StoryPrismaRepository();
    const allStories = await repository.findAll({
      epicId: options?.filters?.epicId ? EpicId.create(options.filters.epicId) : undefined,
      status: options?.filters?.status ? StoryStatus.fromString(options.filters.status) : undefined,
      priority: options?.filters?.priority ? Priority.fromString(options.filters.priority) : undefined,
    });
    
    const total = allStories.length;

    // Apply sorting
    let sortedStories = [...allStories];
    if (options?.sorting?.sortBy) {
      sortedStories.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        if (options.sorting!.sortBy === 'title') {
          aValue = a.getTitle();
          bValue = b.getTitle();
        } else if (options.sorting!.sortBy === 'status') {
          aValue = a.getStatus().getValue();
          bValue = b.getStatus().getValue();
        } else if (options.sorting!.sortBy === 'priority') {
          aValue = a.getPriority().getValue();
          bValue = b.getPriority().getValue();
        } else {
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
        }
        
        const comparison = String(aValue).localeCompare(String(bValue));
        return options.sorting!.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    const page = options?.pagination?.page || 1;
    const pageSize = options?.pagination?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedStories = sortedStories.slice(startIndex, endIndex);
    
    return success({
      stories: paginatedStories.map(story => storyToDto(story)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to list stories'
    );
  }
}

/**
 * Get story by ID
 */
export async function getStory(id: string): Promise<ActionResult<StoryDto>> {
  try {
    const repository = new StoryPrismaRepository();
    const storyId = StoryId.create(id);
    const story = await repository.findById(storyId);
    
    if (!story) {
      return failure('Story not found');
    }
    
    return success(storyToDto(story));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to get story'
    );
  }
}

/**
 * Link story to epic
 */
export async function linkStoryToEpic(
  storyId: string,
  epicId: string
): Promise<ActionResult<void>> {
  try {
    const storyRepository = new StoryPrismaRepository();
    const epicRepository = new EpicPrismaRepository();
    const useCase = new LinkStoryToEpicUseCase(storyRepository, epicRepository);
    
    await useCase.execute({ storyId, epicId });
    
    revalidatePath('/stories');
    revalidatePath(`/epics/${epicId}`);
    revalidatePath(`/stories/${storyId}`);
    
    return success(undefined);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to link story to epic'
    );
  }
}

/**
 * Update story
 */
export async function updateStory(
  id: string,
  updates: {
    title?: string;
    description?: string;
    as?: string;
    iWant?: string;
    soThat?: string;
    acceptanceCriteria?: string[];
    storyPoints?: number;
    status?: string;
    priority?: string;
    epicId?: string;
  }
): Promise<ActionResult<StoryDto>> {
  try {
    const storyRepository = new StoryPrismaRepository();
    const epicRepository = new EpicPrismaRepository();
    const eventBus = new EventBusAdapter();
    const { UpdateStoryUseCase } = await import('@/core/application/use-cases/story/update-story.use-case');
    const useCase = new UpdateStoryUseCase(storyRepository, epicRepository, eventBus);
    
    const story = await useCase.execute({
      id,
      ...updates,
    });
    
    revalidatePath('/stories');
    revalidatePath(`/stories/${id}`);
    if (updates.epicId) {
      revalidatePath(`/epics/${updates.epicId}`);
    }
    revalidatePath('/');
    
    return success(storyToDto(story));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to update story'
    );
  }
}

/**
 * Delete story
 */
export async function deleteStory(id: string): Promise<ActionResult<void>> {
  try {
    const storyRepository = new StoryPrismaRepository();
    const useCase = new DeleteStoryUseCase(storyRepository);
    
    await useCase.execute({ id });
    
    revalidatePath('/stories');
    revalidatePath('/');
    
    return success(undefined);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to delete story'
    );
  }
}
