import { Sprint } from '../../domain/entities/sprint';
import { SprintId } from '../../domain/value-objects/identifier';
import { SprintStatus } from '../../domain/value-objects/status';

export interface SprintFilters {
  status?: SprintStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface SprintRepositoryPort {
  save(sprint: Sprint): Promise<Sprint>;
  findById(id: SprintId): Promise<Sprint | null>;
  findAll(filters?: SprintFilters): Promise<Sprint[]>;
  delete(id: SprintId): Promise<void>;
  exists(id: SprintId): Promise<boolean>;
}
