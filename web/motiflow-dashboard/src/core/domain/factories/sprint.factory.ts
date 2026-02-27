/**
 * Sprint Factory
 * 
 * Factory Pattern for creating Sprint entities.
 * Encapsulates complex creation logic.
 */

import { Sprint } from '../entities/sprint';
import { SprintId } from '../value-objects/identifier';
import { SprintStatus } from '../value-objects/status';

export interface SprintFactoryParams {
  name: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
  durationDays?: number;
}

/**
 * Sprint Factory
 * 
 * Factory for creating Sprint entities with validation and default values.
 */
export class SprintFactory {
  /**
   * Create a new sprint
   */
  static create(params: SprintFactoryParams): Sprint {
    // Validate name
    if (!params.name || params.name.trim().length === 0) {
      throw new Error('Sprint name is required');
    }

    // Calculate endDate if duration is provided
    let endDate = params.endDate;
    if (params.durationDays && params.startDate && !endDate) {
      endDate = new Date(params.startDate);
      endDate.setDate(endDate.getDate() + params.durationDays);
    }

    // Validate dates
    if (params.startDate && endDate && endDate < params.startDate) {
      throw new Error('End date cannot be before start date');
    }

    return Sprint.create({
      name: params.name,
      goal: params.goal,
      startDate: params.startDate,
      endDate,
    });
  }

  /**
   * Create sprint from existing data (reconstitution)
   */
  static reconstitute(data: {
    id: string;
    name: string;
    goal?: string;
    status: string;
    startDate?: Date | null;
    endDate?: Date | null;
    stories?: any[];
    createdAt: Date;
    updatedAt: Date;
  }): Sprint {
    return Sprint.reconstitute({
      id: SprintId.create(data.id),
      name: data.name,
      goal: data.goal,
      status: SprintStatus.fromString(data.status),
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      stories: data.stories || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
