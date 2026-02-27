'use server';

import { revalidatePath } from 'next/cache';
import { MoveCardUseCase, UpdateCardStatusUseCase } from '@/core/application/use-cases/kanban';
import { StoryPrismaRepository } from '@/adapters/driven/persistence/prisma/story-prisma-repository';
import { TaskPrismaRepository } from '@/adapters/driven/persistence/prisma/task-prisma-repository';
import { UpdateStoryUseCase } from '@/core/application/use-cases/story/update-story.use-case';
import { UpdateTaskUseCase } from '@/core/application/use-cases/task/update-task.use-case';
import { EpicPrismaRepository } from '@/adapters/driven/persistence/prisma/epic-prisma-repository';
import { EventBusAdapter } from '@/adapters/driven/events/event-bus.adapter';
import { StoryStatus } from '@/core/domain/value-objects/status';
import { ActionResult, success, failure } from './types';

// Map Story status to Kanban column states
const STORY_STATUS_TO_COLUMN: Record<string, string> = {
  'BACKLOG': 'BACKLOG',
  'PLANNED': 'TODO',
  'IN_PROGRESS': 'IN_PROGRESS',
  'REVIEW': 'REVIEW',
  'DONE': 'DONE',
};

const COLUMN_TO_STORY_STATUS: Record<string, string> = {
  'BACKLOG': 'BACKLOG',
  'TODO': 'PLANNED',
  'IN_PROGRESS': 'IN_PROGRESS',
  'REVIEW': 'REVIEW',
  'DONE': 'DONE',
};

// Map Task status to Kanban column states
const TASK_STATUS_TO_COLUMN: Record<string, string> = {
  'TODO': 'TODO',
  'IN_PROGRESS': 'IN_PROGRESS',
  'REVIEW': 'REVIEW',
  'DONE': 'DONE',
};

const COLUMN_TO_TASK_STATUS: Record<string, string> = {
  'TODO': 'TODO',
  'IN_PROGRESS': 'IN_PROGRESS',
  'REVIEW': 'REVIEW',
  'DONE': 'DONE',
};

/**
 * Get Kanban board with Stories and Tasks from database
 */
export async function getKanbanBoard(boardId: string = 'default'): Promise<ActionResult<{
  id: string;
  name: string;
  columns: Array<{
    id: string;
    name: string;
    state: string;
    cards: Array<{
      id: string;
      title: string;
      description?: string;
      state: string;
      storyId?: string;
      taskId?: string;
      assignee?: string;
      priority?: string;
      order: number;
    }>;
    order: number;
  }>;
}>> {
  try {
    const storyRepository = new StoryPrismaRepository();
    const taskRepository = new TaskPrismaRepository();

    // Fetch all stories and tasks
    const stories = await storyRepository.findAll();
    const tasks = await taskRepository.findAll();

    // Define columns based on Story statuses
    const columnStates = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    const columnNames: Record<string, string> = {
      'BACKLOG': 'Backlog',
      'TODO': 'To Do',
      'IN_PROGRESS': 'In Progress',
      'REVIEW': 'Review',
      'DONE': 'Done',
    };

    // Group stories by status
    const storiesByStatus = new Map<string, typeof stories>();
    stories.forEach(story => {
      const status = story.getStatus().getValue();
      const columnState = STORY_STATUS_TO_COLUMN[status] || 'BACKLOG';
      if (!storiesByStatus.has(columnState)) {
        storiesByStatus.set(columnState, []);
      }
      storiesByStatus.get(columnState)!.push(story);
    });

    // Group tasks by status
    const tasksByStatus = new Map<string, typeof tasks>();
    tasks.forEach(task => {
      const status = task.getStatus().getValue();
      const columnState = TASK_STATUS_TO_COLUMN[status] || 'TODO';
      if (!tasksByStatus.has(columnState)) {
        tasksByStatus.set(columnState, []);
      }
      tasksByStatus.get(columnState)!.push(task);
    });

    // Build columns
    const columns = columnStates.map((state, index) => {
      const storyCards = (storiesByStatus.get(state) || []).map((story, cardIndex) => ({
        id: `story-${story.id.getValue()}`,
        title: story.getTitle(),
        description: story.getDescription() || undefined,
        state,
        storyId: story.id.getValue(),
        assignee: undefined,
        priority: story.getPriority().getValue(),
        order: cardIndex,
      }));

      const taskCards = (tasksByStatus.get(state) || []).map((task, cardIndex) => ({
        id: `task-${task.id.getValue()}`,
        title: task.getTitle(),
        description: task.getDescription() || undefined,
        state,
        taskId: task.id.getValue(),
        assignee: task.getAssignee() || undefined,
        priority: task.getPriority().getValue(),
        order: storyCards.length + cardIndex,
      }));

      return {
        id: state.toLowerCase().replace('_', '-'),
        name: columnNames[state] || state,
        state,
        cards: [...storyCards, ...taskCards],
        order: index,
      };
    });

    return success({
      id: boardId,
      name: 'Main Kanban Board',
      columns,
    });
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to get Kanban board'
    );
  }
}

/**
 * Move card between columns
 */
export async function moveCard(
  boardId: string,
  cardId: string,
  targetColumnId: string,
  newOrder?: number
): Promise<ActionResult<void>> {
  try {
    // Extract entity type and ID from cardId (format: "story-{id}" or "task-{id}")
    const isStory = cardId.startsWith('story-');
    const isTask = cardId.startsWith('task-');
    
    if (!isStory && !isTask) {
      return failure('Invalid card ID format');
    }

    const entityId = isStory 
      ? cardId.replace('story-', '')
      : cardId.replace('task-', '');

    // Map column ID to status
    // Column IDs are like "backlog", "to-do", "in-progress", etc.
    const columnIdToState: Record<string, string> = {
      'backlog': 'BACKLOG',
      'to-do': 'TODO',
      'todo': 'TODO',
      'in-progress': 'IN_PROGRESS',
      'review': 'REVIEW',
      'done': 'DONE',
    };

    const targetState = columnIdToState[targetColumnId.toLowerCase()] || targetColumnId.toUpperCase();
    
    if (isStory) {
      // Update story status
      const storyRepository = new StoryPrismaRepository();
      const epicRepository = new EpicPrismaRepository();
      const eventBus = new EventBusAdapter();
      const useCase = new UpdateStoryUseCase(storyRepository, epicRepository, eventBus);
      
      const newStatus = COLUMN_TO_STORY_STATUS[targetState] || targetState;
      await useCase.execute({
        id: entityId,
        status: newStatus,
      });
    } else {
      // Update task status
      const taskRepository = new TaskPrismaRepository();
      const storyRepository = new StoryPrismaRepository();
      const eventBus = new EventBusAdapter();
      const useCase = new UpdateTaskUseCase(taskRepository, storyRepository, eventBus);
      
      const newStatus = COLUMN_TO_TASK_STATUS[targetState] || targetState;
      await useCase.execute({
        id: entityId,
        status: newStatus,
      });
    }

    revalidatePath('/kanban');
    revalidatePath('/stories');
    revalidatePath('/tasks');
    return success(undefined);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to move card'
    );
  }
}

/**
 * Update card status
 */
export async function updateCardStatus(
  boardId: string,
  cardId: string,
  newState: string
): Promise<ActionResult<void>> {
  try {
    // Extract entity type and ID from cardId
    const isStory = cardId.startsWith('story-');
    const isTask = cardId.startsWith('task-');
    
    if (!isStory && !isTask) {
      return failure('Invalid card ID format');
    }

    const entityId = isStory 
      ? cardId.replace('story-', '')
      : cardId.replace('task-', '');

    if (isStory) {
      const storyRepository = new StoryPrismaRepository();
      const epicRepository = new EpicPrismaRepository();
      const eventBus = new EventBusAdapter();
      const useCase = new UpdateStoryUseCase(storyRepository, epicRepository, eventBus);
      
      const newStatus = COLUMN_TO_STORY_STATUS[newState] || newState;
      await useCase.execute({
        id: entityId,
        status: newStatus,
      });
    } else {
      const taskRepository = new TaskPrismaRepository();
      const storyRepository = new StoryPrismaRepository();
      const eventBus = new EventBusAdapter();
      const useCase = new UpdateTaskUseCase(taskRepository, storyRepository, eventBus);
      
      const newStatus = COLUMN_TO_TASK_STATUS[newState] || newState;
      await useCase.execute({
        id: entityId,
        status: newStatus,
      });
    }

    revalidatePath('/kanban');
    revalidatePath('/stories');
    revalidatePath('/tasks');
    return success(undefined);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to update card status'
    );
  }
}
