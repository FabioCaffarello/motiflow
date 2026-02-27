'use server';

import { revalidatePath } from 'next/cache';
import { CreateSprintUseCase } from '@/core/application/use-cases/sprint/create-sprint.use-case';
import { UpdateSprintUseCase } from '@/core/application/use-cases/sprint/update-sprint.use-case';
import { DeleteSprintUseCase } from '@/core/application/use-cases/sprint/delete-sprint.use-case';
import { ListSprintsUseCase } from '@/core/application/use-cases/sprint/list-sprints.use-case';
import { StartSprintUseCase } from '@/core/application/use-cases/sprint/start-sprint.use-case';
import { CompleteSprintUseCase } from '@/core/application/use-cases/sprint/complete-sprint.use-case';
import { AddStoryToSprintUseCase } from '@/core/application/use-cases/sprint/add-story-to-sprint.use-case';
import { RemoveStoryFromSprintUseCase } from '@/core/application/use-cases/sprint/remove-story-from-sprint.use-case';
import { SprintPrismaRepository } from '@/adapters/driven/persistence/prisma/sprint-prisma-repository';
import { StoryPrismaRepository } from '@/adapters/driven/persistence/prisma/story-prisma-repository';
import { EventBusAdapter } from '@/adapters/driven/events/event-bus.adapter';
import { SprintDto, SprintDtoMapper } from '@/core/application/dtos/sprint.dto';
import { SprintId } from '@/core/domain/value-objects/identifier';
import { ActionResult, success, failure } from './types';

// Helper to convert Sprint to DTO
function sprintToDto(sprint: any): SprintDto {
  return SprintDtoMapper.toDto(sprint);
}

/**
 * Create a new sprint
 */
export async function createSprint(
  name: string,
  goal?: string,
  startDate?: Date,
  endDate?: Date,
  durationDays?: number
): Promise<ActionResult<SprintDto>> {
  try {
    const repository = new SprintPrismaRepository();
    const eventBus = new EventBusAdapter();
    const useCase = new CreateSprintUseCase(repository, eventBus);
    
    const sprint = await useCase.execute({
      name,
      goal,
      startDate,
      endDate,
      durationDays,
    });
    
    revalidatePath('/sprints');
    revalidatePath('/');
    
    return success(sprintToDto(sprint));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to create sprint'
    );
  }
}

/**
 * List all sprints with optional filters, pagination, and sorting
 */
export async function listSprints(
  options?: {
    filters?: { status?: string; startDate?: string; endDate?: string };
    pagination?: { page?: number; pageSize?: number };
    sorting?: { sortBy?: string; sortOrder?: 'asc' | 'desc' };
  }
): Promise<ActionResult<{
  sprints: SprintDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>> {
  try {
    const repository = new SprintPrismaRepository();
    const useCase = new ListSprintsUseCase(repository);
    
    const result = await useCase.execute({
      status: options?.filters?.status,
      startDate: options?.filters?.startDate ? new Date(options.filters.startDate) : undefined,
      endDate: options?.filters?.endDate ? new Date(options.filters.endDate) : undefined,
      page: options?.pagination?.page,
      pageSize: options?.pagination?.pageSize,
      sortBy: options?.sorting?.sortBy,
      sortOrder: options?.sorting?.sortOrder,
    });
    
    return success({
      sprints: result.sprints.map(sprint => sprintToDto(sprint)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to list sprints'
    );
  }
}

/**
 * Get sprint by ID
 */
export async function getSprint(id: string): Promise<ActionResult<SprintDto>> {
  try {
    const repository = new SprintPrismaRepository();
    const sprintId = SprintId.create(id);
    const sprint = await repository.findById(sprintId);
    
    if (!sprint) {
      return failure('Sprint not found');
    }
    
    return success(sprintToDto(sprint));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to get sprint'
    );
  }
}

/**
 * Update sprint
 */
export async function updateSprint(
  id: string,
  updates: {
    name?: string;
    goal?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<ActionResult<SprintDto>> {
  try {
    const repository = new SprintPrismaRepository();
    const eventBus = new EventBusAdapter();
    const useCase = new UpdateSprintUseCase(repository, eventBus);
    
    const sprint = await useCase.execute({
      id,
      ...updates,
    });
    
    revalidatePath('/sprints');
    revalidatePath(`/sprints/${id}`);
    revalidatePath('/');
    
    return success(sprintToDto(sprint));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to update sprint'
    );
  }
}

/**
 * Delete sprint
 */
export async function deleteSprint(id: string): Promise<ActionResult<void>> {
  try {
    const repository = new SprintPrismaRepository();
    const useCase = new DeleteSprintUseCase(repository);
    
    await useCase.execute({ id });
    
    revalidatePath('/sprints');
    revalidatePath('/');
    
    return success(undefined);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to delete sprint'
    );
  }
}

/**
 * Start a sprint
 */
export async function startSprint(id: string): Promise<ActionResult<SprintDto>> {
  try {
    const repository = new SprintPrismaRepository();
    const eventBus = new EventBusAdapter();
    const useCase = new StartSprintUseCase(repository, eventBus);
    
    const sprint = await useCase.execute({ id });
    
    revalidatePath('/sprints');
    revalidatePath(`/sprints/${id}`);
    revalidatePath('/');
    
    return success(sprintToDto(sprint));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to start sprint'
    );
  }
}

/**
 * Complete a sprint
 */
export async function completeSprint(id: string): Promise<ActionResult<SprintDto>> {
  try {
    const repository = new SprintPrismaRepository();
    const eventBus = new EventBusAdapter();
    const useCase = new CompleteSprintUseCase(repository, eventBus);
    
    const sprint = await useCase.execute({ id });
    
    revalidatePath('/sprints');
    revalidatePath(`/sprints/${id}`);
    revalidatePath('/');
    
    return success(sprintToDto(sprint));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to complete sprint'
    );
  }
}

/**
 * Cancel a sprint
 */
export async function cancelSprint(id: string): Promise<ActionResult<SprintDto>> {
  try {
    const repository = new SprintPrismaRepository();
    const eventBus = new EventBusAdapter();
    const sprintId = SprintId.create(id);
    const sprint = await repository.findById(sprintId);
    
    if (!sprint) {
      return failure('Sprint not found');
    }
    
    sprint.cancel();
    const savedSprint = await repository.save(sprint);
    
    // Publish events
    const events = savedSprint.getDomainEvents();
    for (const event of events) {
      await eventBus.publish(event);
    }
    savedSprint.clearDomainEvents();
    
    revalidatePath('/sprints');
    revalidatePath(`/sprints/${id}`);
    revalidatePath('/');
    
    return success(sprintToDto(savedSprint));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to cancel sprint'
    );
  }
}

/**
 * Add story to sprint
 */
export async function addStoryToSprint(
  sprintId: string,
  storyId: string,
  order?: number
): Promise<ActionResult<void>> {
  try {
    const sprintRepository = new SprintPrismaRepository();
    const storyRepository = new StoryPrismaRepository();
    const useCase = new AddStoryToSprintUseCase(sprintRepository, storyRepository);
    
    await useCase.execute({ sprintId, storyId, order });
    
    revalidatePath('/sprints');
    revalidatePath(`/sprints/${sprintId}`);
    revalidatePath('/stories');
    revalidatePath('/');
    
    return success(undefined);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to add story to sprint'
    );
  }
}

/**
 * Remove story from sprint
 */
export async function removeStoryFromSprint(
  sprintId: string,
  storyId: string
): Promise<ActionResult<void>> {
  try {
    const sprintRepository = new SprintPrismaRepository();
    const useCase = new RemoveStoryFromSprintUseCase(sprintRepository);
    
    await useCase.execute({ sprintId, storyId });
    
    revalidatePath('/sprints');
    revalidatePath(`/sprints/${sprintId}`);
    revalidatePath('/stories');
    revalidatePath('/');
    
    return success(undefined);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to remove story from sprint'
    );
  }
}
