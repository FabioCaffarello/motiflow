import { EpicRepositoryPort, EpicFilters } from '@/core/ports/repositories/epic-repository.port';
import { Epic } from '@/core/domain/entities/epic';
import { EpicStatus } from '@/core/domain/value-objects/status';
import { Priority } from '@/core/domain/value-objects/priority';

export interface ListEpicsQuery {
  status?: string;
  priority?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListEpicsResult {
  epics: Epic[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ListEpicsUseCase {
  constructor(private epicRepository: EpicRepositoryPort) {}

  async execute(query?: ListEpicsQuery): Promise<ListEpicsResult> {
    const filters: EpicFilters = {};

    if (query?.status) {
      filters.status = EpicStatus.fromString(query.status);
    }

    if (query?.priority) {
      filters.priority = Priority.fromString(query.priority);
    }

    const allEpics = await this.epicRepository.findAll(filters);
    const total = allEpics.length;

    // Apply sorting
    let sortedEpics = [...allEpics];
    if (query?.sortBy) {
      sortedEpics.sort((a, b) => {
        const aValue = (a as any)[query.sortBy!];
        const bValue = (b as any)[query.sortBy!];
        const comparison = String(aValue).localeCompare(String(bValue));
        return query.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    const page = query?.page || 1;
    const pageSize = query?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEpics = sortedEpics.slice(startIndex, endIndex);

    return {
      epics: paginatedEpics,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
