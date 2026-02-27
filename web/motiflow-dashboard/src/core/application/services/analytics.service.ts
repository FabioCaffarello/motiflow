import { EpicRepositoryPort } from '../../ports/repositories/epic-repository.port';
import { StoryRepositoryPort } from '../../ports/repositories/story-repository.port';
import { TaskRepositoryPort } from '../../ports/repositories/task-repository.port';

export interface EpicMetrics {
  totalEpics: number;
  completedEpics: number;
  activeEpics: number;
  averageCompletionPercentage: number;
}

export interface StoryMetrics {
  totalStories: number;
  completedStories: number;
  inProgressStories: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
}

export interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  averageEstimate: number;
}

export interface OverallMetrics {
  epics: EpicMetrics;
  stories: StoryMetrics;
  tasks: TaskMetrics;
}

/**
 * AnalyticsService
 * 
 * Application service for calculating metrics and analytics.
 */
export class AnalyticsService {
  constructor(
    private epicRepository: EpicRepositoryPort,
    private storyRepository: StoryRepositoryPort,
    private taskRepository: TaskRepositoryPort
  ) {}

  /**
   * Get overall metrics for the dashboard
   */
  async getOverallMetrics(): Promise<OverallMetrics> {
    const [epicMetrics, storyMetrics, taskMetrics] = await Promise.all([
      this.getEpicMetrics(),
      this.getStoryMetrics(),
      this.getTaskMetrics(),
    ]);

    return {
      epics: epicMetrics,
      stories: storyMetrics,
      tasks: taskMetrics,
    };
  }

  /**
   * Get epic metrics
   */
  async getEpicMetrics(): Promise<EpicMetrics> {
    const epics = await this.epicRepository.findAll();
    
    const totalEpics = epics.length;
    const completedEpics = epics.filter(
      e => e.getStatus().getValue() === 'COMPLETED'
    ).length;
    const activeEpics = epics.filter(
      e => e.getStatus().getValue() === 'ACTIVE'
    ).length;

    // Calculate average completion percentage
    let totalCompletion = 0;
    epics.forEach(epic => {
      const stories = epic.getStories();
      if (stories.length > 0) {
        const completed = stories.filter(s => s.getStatus().getValue() === 'DONE').length;
        totalCompletion += (completed / stories.length) * 100;
      } else {
        totalCompletion += epic.getStatus().getValue() === 'COMPLETED' ? 100 : 0;
      }
    });
    const averageCompletionPercentage = totalEpics > 0 
      ? Math.round(totalCompletion / totalEpics) 
      : 0;

    return {
      totalEpics,
      completedEpics,
      activeEpics,
      averageCompletionPercentage,
    };
  }

  /**
   * Get story metrics
   */
  async getStoryMetrics(): Promise<StoryMetrics> {
    const stories = await this.storyRepository.findAll();
    
    const totalStories = stories.length;
    const completedStories = stories.filter(
      s => s.getStatus().getValue() === 'DONE'
    ).length;
    const inProgressStories = stories.filter(
      s => s.getStatus().getValue() === 'IN_PROGRESS'
    ).length;

    let totalStoryPoints = 0;
    let completedStoryPoints = 0;
    
    stories.forEach(story => {
      const points = story.getStoryPoints()?.getValue() || 0;
      totalStoryPoints += points;
      if (story.getStatus().getValue() === 'DONE') {
        completedStoryPoints += points;
      }
    });

    return {
      totalStories,
      completedStories,
      inProgressStories,
      totalStoryPoints,
      completedStoryPoints,
    };
  }

  /**
   * Get task metrics
   */
  async getTaskMetrics(): Promise<TaskMetrics> {
    const tasks = await this.taskRepository.findAll();
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      t => t.getStatus().getValue() === 'DONE'
    ).length;
    const inProgressTasks = tasks.filter(
      t => t.getStatus().getValue() === 'IN_PROGRESS'
    ).length;

    let totalEstimate = 0;
    let tasksWithEstimate = 0;
    
    tasks.forEach(task => {
      const estimate = task.getEstimate();
      if (estimate !== null) {
        totalEstimate += estimate;
        tasksWithEstimate++;
      }
    });

    const averageEstimate = tasksWithEstimate > 0
      ? Math.round(totalEstimate / tasksWithEstimate)
      : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      averageEstimate,
    };
  }
}
