import { Story } from '../../domain/entities/story';
import { StoryId, EpicId } from '../../domain/value-objects/identifier';
import { StoryStatus } from '../../domain/value-objects/status';
import { Priority } from '../../domain/value-objects/priority';

export interface StoryFilters {
  epicId?: EpicId;
  status?: StoryStatus;
  priority?: Priority;
}

export interface StoryRepositoryPort {
  save(story: Story): Promise<Story>;
  findById(id: StoryId): Promise<Story | null>;
  findByEpicId(epicId: EpicId): Promise<Story[]>;
  findAll(filters?: StoryFilters): Promise<Story[]>;
  delete(id: StoryId): Promise<void>;
  exists(id: StoryId): Promise<boolean>;
}
