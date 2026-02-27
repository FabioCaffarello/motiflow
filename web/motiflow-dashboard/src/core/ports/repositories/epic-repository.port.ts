import { Epic } from '../../domain/entities/epic';
import { EpicId } from '../../domain/value-objects/identifier';
import { EpicStatus } from '../../domain/value-objects/status';
import { Priority } from '../../domain/value-objects/priority';

export interface EpicFilters {
  status?: EpicStatus;
  priority?: Priority;
}

export interface EpicRepositoryPort {
  save(epic: Epic): Promise<Epic>;
  findById(id: EpicId): Promise<Epic | null>;
  findAll(filters?: EpicFilters): Promise<Epic[]>;
  delete(id: EpicId): Promise<void>;
  exists(id: EpicId): Promise<boolean>;
}
