import { SprintRepositoryPort, SprintFilters } from '@/core/ports/repositories/sprint-repository.port';
import { Sprint } from '@/core/domain/entities/sprint';

export interface ListSprintsQuery {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListSprintsResult {
  sprints: Sprint[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ListSprintsUseCase {
  constructor(
    private sprintRepository: SprintRepositoryPort
  ) {}

  async execute(query?: ListSprintsQuery): Promise<ListSprintsResult> {
    const filters: SprintFilters = {};

    if (query?.status) {
      const { SprintStatus } = await import('@/core/domain/value-objects/status');
      filters.status = SprintStatus.fromString(query.status);
    }

    if (query?.startDate) {
      filters.startDate = query.startDate;
    }

    if (query?.endDate) {
      filters.endDate = query.endDate;
    }

    const allSprints = await this.sprintRepository.findAll(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    const total = allSprints.length;

    // Apply sorting
    let sortedSprints = [...allSprints];
    if (query?.sortBy) {
      sortedSprints.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        if (query.sortBy === 'name') {
          aValue = a.getName();
          bValue = b.getName();
        } else if (query.sortBy === 'status') {
          aValue = a.getStatus().getValue();
          bValue = b.getStatus().getValue();
        } else if (query.sortBy === 'startDate') {
          aValue = a.getStartDate()?.getTime() || 0;
          bValue = b.getStartDate()?.getTime() || 0;
        } else if (query.sortBy === 'endDate') {
          aValue = a.getEndDate()?.getTime() || 0;
          bValue = b.getEndDate()?.getTime() || 0;
        } else {
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
        }
        
        const comparison = String(aValue).localeCompare(String(bValue));
        return query.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    const page = query?.page || 1;
    const pageSize = query?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedSprints = sortedSprints.slice(startIndex, endIndex);

    return {
      sprints: paginatedSprints,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
