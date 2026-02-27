'use server';

import { revalidatePath } from 'next/cache';
import { CreateEpicUseCase } from '@/core/application/use-cases/epic/create-epic.use-case';
import { ListEpicsUseCase } from '@/core/application/use-cases/epic/list-epics.use-case';
import { UpdateEpicUseCase } from '@/core/application/use-cases/epic/update-epic.use-case';
import { EpicPrismaRepository } from '@/adapters/driven/persistence/prisma/epic-prisma-repository';
import { EventBusAdapter } from '@/adapters/driven/events/event-bus.adapter';
import { EpicDtoMapper, EpicDto } from '@/core/application/dtos/epic.dto';
import { EpicId } from '@/core/domain/value-objects/identifier';
import { ActionResult, success, failure } from './types';

/**
 * Create a new epic
 */
export async function createEpic(
  title: string,
  description?: string,
  priority?: string
): Promise<ActionResult<EpicDto>> {
  try {
    const repository = new EpicPrismaRepository();
    const eventBus = new EventBusAdapter();
    const useCase = new CreateEpicUseCase(repository, eventBus);
    
    const epic = await useCase.execute({
      title,
      description,
      priority,
    });
    
    revalidatePath('/epics');
    revalidatePath('/');
    
    return success(EpicDtoMapper.toDto(epic));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to create epic'
    );
  }
}

/**
 * List all epics with optional filters, pagination, and sorting
 */
export async function listEpics(
  options?: {
    filters?: { status?: string; priority?: string };
    pagination?: { page?: number; pageSize?: number };
    sorting?: { sortBy?: string; sortOrder?: 'asc' | 'desc' };
  }
): Promise<ActionResult<{
  epics: EpicDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>> {
  try {
    const repository = new EpicPrismaRepository();
    const useCase = new ListEpicsUseCase(repository);
    
    const result = await useCase.execute({
      status: options?.filters?.status,
      priority: options?.filters?.priority,
      page: options?.pagination?.page,
      pageSize: options?.pagination?.pageSize,
      sortBy: options?.sorting?.sortBy,
      sortOrder: options?.sorting?.sortOrder,
    });
    
    return success({
      epics: result.epics.map(epic => EpicDtoMapper.toDto(epic)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to list epics'
    );
  }
}

/**
 * Get epic by ID
 */
export async function getEpic(id: string): Promise<ActionResult<EpicDto>> {
  try {
    const repository = new EpicPrismaRepository();
    const epicId = EpicId.create(id);
    const epic = await repository.findById(epicId);
    
    if (!epic) {
      return failure('Epic not found');
    }
    
    return success(EpicDtoMapper.toDto(epic));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to get epic'
    );
  }
}

/**
 * Update epic
 */
export async function updateEpic(
  id: string,
  updates: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
  }
): Promise<ActionResult<EpicDto>> {
  try {
    const repository = new EpicPrismaRepository();
    const eventBus = new EventBusAdapter();
    const useCase = new UpdateEpicUseCase(repository, eventBus);
    
    const epic = await useCase.execute({
      id,
      ...updates,
    });
    
    revalidatePath('/epics');
    revalidatePath(`/epics/${id}`);
    revalidatePath('/');
    
    return success(EpicDtoMapper.toDto(epic));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to update epic'
    );
  }
}

/**
 * Delete epic
 */
export async function deleteEpic(id: string): Promise<ActionResult<void>> {
  try {
    const repository = new EpicPrismaRepository();
    const epicId = EpicId.create(id);
    
    await repository.delete(epicId);
    
    revalidatePath('/epics');
    revalidatePath('/');
    
    return success(undefined);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to delete epic'
    );
  }
}
