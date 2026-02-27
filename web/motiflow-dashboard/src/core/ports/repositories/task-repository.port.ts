import { Task } from '../../domain/entities/task';
import { TaskId, StoryId } from '../../domain/value-objects/identifier';
import { TaskStatus } from '../../domain/value-objects/status';
import { Priority } from '../../domain/value-objects/priority';

export interface TaskFilters {
  storyId?: StoryId;
  status?: TaskStatus;
  priority?: Priority;
  assignee?: string;
}

export interface TaskRepositoryPort {
  save(task: Task): Promise<Task>;
  findById(id: TaskId): Promise<Task | null>;
  findByStoryId(storyId: StoryId): Promise<Task[]>;
  findAll(filters?: TaskFilters): Promise<Task[]>;
  delete(id: TaskId): Promise<void>;
  exists(id: TaskId): Promise<boolean>;
}
