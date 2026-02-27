'use server';

import { revalidatePath } from 'next/cache';
import { CreateTaskUseCase } from '@/core/application/use-cases/task/create-task.use-case';
import { TaskPrismaRepository } from '@/adapters/driven/persistence/prisma/task-prisma-repository';
import { StoryPrismaRepository } from '@/adapters/driven/persistence/prisma/story-prisma-repository';
import { TaskDto } from '@/core/application/dtos/task.dto';
import { TaskId, StoryId } from '@/core/domain/value-objects/identifier';
import { TaskStatus } from '@/core/domain/value-objects/status';
import { Priority } from '@/core/domain/value-objects/priority';
import { ActionResult, success, failure } from './types';

// Helper to convert Task to DTO
function taskToDto(task: any): TaskDto {
  return {
    id: task.id.getValue(),
    title: task.getTitle(),
    description: task.getDescription(),
    status: task.getStatus().getValue(),
    priority: task.getPriority().getValue(),
    estimate: task.getEstimate(),
    assignee: task.getAssignee(),
    storyId: task.getStoryId()?.getValue() || null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.getUpdatedAt().toISOString(),
  };
}

/**
 * Create a new task
 */
export async function createTask(
  title: string,
  storyId: string,
  description?: string,
  priority?: string,
  estimate?: number,
  assignee?: string
): Promise<ActionResult<TaskDto>> {
  try {
    const taskRepository = new TaskPrismaRepository();
    const storyRepository = new StoryPrismaRepository();
    const eventBus = new EventBusAdapter();
    const useCase = new CreateTaskUseCase(taskRepository, storyRepository, eventBus);
    
    const task = await useCase.execute({
      title,
      description,
      priority,
      estimate,
      assignee,
      storyId,
    });
    
    revalidatePath('/tasks');
    if (storyId) {
      revalidatePath(`/stories/${storyId}`);
      // Find epicId from story to revalidate epic page
      const story = await storyRepository.findById(StoryId.create(storyId));
      if (story?.getEpicId()) {
        revalidatePath(`/epics/${story.getEpicId()?.getValue()}`);
      }
    }
    revalidatePath('/');
    
    return success(taskToDto(task));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to create task'
    );
  }
}

/**
 * List all tasks with optional filters, pagination, and sorting
 */
export async function listTasks(
  options?: {
    filters?: { storyId?: string; status?: string; priority?: string; assignee?: string };
    pagination?: { page?: number; pageSize?: number };
    sorting?: { sortBy?: string; sortOrder?: 'asc' | 'desc' };
  }
): Promise<ActionResult<{
  tasks: TaskDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>> {
  try {
    const repository = new TaskPrismaRepository();
    const allTasks = await repository.findAll({
      storyId: options?.filters?.storyId ? StoryId.create(options.filters.storyId) : undefined,
      status: options?.filters?.status ? TaskStatus.fromString(options.filters.status) : undefined,
      priority: options?.filters?.priority ? Priority.fromString(options.filters.priority) : undefined,
      assignee: options?.filters?.assignee,
    });
    
    const total = allTasks.length;

    // Apply sorting
    let sortedTasks = [...allTasks];
    if (options?.sorting?.sortBy) {
      sortedTasks.sort((a, b) => {
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
    const paginatedTasks = sortedTasks.slice(startIndex, endIndex);
    
    return success({
      tasks: paginatedTasks.map(task => taskToDto(task)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to list tasks'
    );
  }
}

/**
 * Get task by ID
 */
export async function getTask(id: string): Promise<ActionResult<TaskDto>> {
  try {
    const repository = new TaskPrismaRepository();
    const taskId = TaskId.create(id);
    const task = await repository.findById(taskId);
    
    if (!task) {
      return failure('Task not found');
    }
    
    return success(taskToDto(task));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to get task'
    );
  }
}

/**
 * Complete a task
 */
export async function completeTask(id: string): Promise<ActionResult<TaskDto>> {
  try {
    const repository = new TaskPrismaRepository();
    const taskId = TaskId.create(id);
    const task = await repository.findById(taskId);
    
    if (!task) {
      return failure('Task not found');
    }
    
    task.complete();
    const updatedTask = await repository.save(task);
    
    revalidatePath('/tasks');
    if (task.getStoryId()) {
      revalidatePath(`/stories/${task.getStoryId()?.getValue()}`);
    }
    revalidatePath('/');
    
    return success(taskToDto(updatedTask));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to complete task'
    );
  }
}

/**
 * Update task
 */
export async function updateTask(
  id: string,
  updates: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    estimate?: number;
    assignee?: string;
    storyId?: string;
  }
): Promise<ActionResult<TaskDto>> {
  try {
    const taskRepository = new TaskPrismaRepository();
    const storyRepository = new StoryPrismaRepository();
    const eventBus = new EventBusAdapter();
    const useCase = new UpdateTaskUseCase(taskRepository, storyRepository, eventBus);
    
    const task = await useCase.execute({
      id,
      ...updates,
    });
    
    revalidatePath('/tasks');
    revalidatePath(`/tasks/${id}`);
    if (updates.storyId) {
      revalidatePath(`/stories/${updates.storyId}`);
    }
    revalidatePath('/');
    
    return success(taskToDto(task));
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to update task'
    );
  }
}

/**
 * Delete task
 */
export async function deleteTask(id: string): Promise<ActionResult<void>> {
  try {
    const taskRepository = new TaskPrismaRepository();
    const useCase = new DeleteTaskUseCase(taskRepository);
    
    await useCase.execute({ id });
    
    revalidatePath('/tasks');
    revalidatePath('/');
    
    return success(undefined);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to delete task'
    );
  }
}
