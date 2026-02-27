import { DomainError } from '../errors/domain-error';

/**
 * Base Status class
 */
export abstract class Status<T extends string> {
  protected constructor(protected readonly value: T) {}

  getValue(): T {
    return this.value;
  }

  equals(other: Status<T>): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  abstract canTransitionTo(newStatus: Status<T>): boolean;
}

// Epic Status
export class EpicStatus extends Status<'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'> {
  static readonly DRAFT = new EpicStatus('DRAFT');
  static readonly ACTIVE = new EpicStatus('ACTIVE');
  static readonly COMPLETED = new EpicStatus('COMPLETED');
  static readonly ARCHIVED = new EpicStatus('ARCHIVED');

  private constructor(value: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED') {
    super(value);
  }

  static fromString(value: string): EpicStatus {
    switch (value) {
      case 'DRAFT':
        return EpicStatus.DRAFT;
      case 'ACTIVE':
        return EpicStatus.ACTIVE;
      case 'COMPLETED':
        return EpicStatus.COMPLETED;
      case 'ARCHIVED':
        return EpicStatus.ARCHIVED;
      default:
        throw new Error(`Invalid EpicStatus: ${value}`);
    }
  }

  canTransitionTo(newStatus: EpicStatus): boolean {
    const transitions: Record<string, string[]> = {
      DRAFT: ['ACTIVE', 'ARCHIVED'],
      ACTIVE: ['COMPLETED', 'ARCHIVED'],
      COMPLETED: ['ARCHIVED'],
      ARCHIVED: [], // Archived is terminal
    };
    return transitions[this.value]?.includes(newStatus.value) ?? false;
  }
}

// Story Status
export class StoryStatus extends Status<'BACKLOG' | 'PLANNED' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'> {
  static readonly BACKLOG = new StoryStatus('BACKLOG');
  static readonly PLANNED = new StoryStatus('PLANNED');
  static readonly IN_PROGRESS = new StoryStatus('IN_PROGRESS');
  static readonly REVIEW = new StoryStatus('REVIEW');
  static readonly DONE = new StoryStatus('DONE');

  private constructor(value: 'BACKLOG' | 'PLANNED' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') {
    super(value);
  }

  static fromString(value: string): StoryStatus {
    switch (value) {
      case 'BACKLOG':
        return StoryStatus.BACKLOG;
      case 'PLANNED':
        return StoryStatus.PLANNED;
      case 'IN_PROGRESS':
        return StoryStatus.IN_PROGRESS;
      case 'REVIEW':
        return StoryStatus.REVIEW;
      case 'DONE':
        return StoryStatus.DONE;
      default:
        throw new Error(`Invalid StoryStatus: ${value}`);
    }
  }

  canTransitionTo(newStatus: StoryStatus): boolean {
    const transitions: Record<string, string[]> = {
      BACKLOG: ['PLANNED', 'IN_PROGRESS'],
      PLANNED: ['IN_PROGRESS', 'BACKLOG'],
      IN_PROGRESS: ['REVIEW', 'BACKLOG'],
      REVIEW: ['DONE', 'IN_PROGRESS'],
      DONE: [], // Done is terminal
    };
    return transitions[this.value]?.includes(newStatus.value) ?? false;
  }
}

// Task Status
export class TaskStatus extends Status<'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'> {
  static readonly TODO = new TaskStatus('TODO');
  static readonly IN_PROGRESS = new TaskStatus('IN_PROGRESS');
  static readonly REVIEW = new TaskStatus('REVIEW');
  static readonly DONE = new TaskStatus('DONE');

  private constructor(value: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') {
    super(value);
  }

  static fromString(value: string): TaskStatus {
    switch (value) {
      case 'TODO':
        return TaskStatus.TODO;
      case 'IN_PROGRESS':
        return TaskStatus.IN_PROGRESS;
      case 'REVIEW':
        return TaskStatus.REVIEW;
      case 'DONE':
        return TaskStatus.DONE;
      default:
        throw new Error(`Invalid TaskStatus: ${value}`);
    }
  }

  canTransitionTo(newStatus: TaskStatus): boolean {
    const transitions: Record<string, string[]> = {
      TODO: ['IN_PROGRESS'],
      IN_PROGRESS: ['REVIEW', 'TODO'],
      REVIEW: ['DONE', 'IN_PROGRESS'],
      DONE: [], // Done is terminal
    };
    return transitions[this.value]?.includes(newStatus.value) ?? false;
  }
}

// Sprint Status
export class SprintStatus extends Status<'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'> {
  static readonly PLANNED = new SprintStatus('PLANNED');
  static readonly ACTIVE = new SprintStatus('ACTIVE');
  static readonly COMPLETED = new SprintStatus('COMPLETED');
  static readonly CANCELLED = new SprintStatus('CANCELLED');

  private constructor(value: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED') {
    super(value);
  }

  static fromString(value: string): SprintStatus {
    switch (value) {
      case 'PLANNED':
        return SprintStatus.PLANNED;
      case 'ACTIVE':
        return SprintStatus.ACTIVE;
      case 'COMPLETED':
        return SprintStatus.COMPLETED;
      case 'CANCELLED':
        return SprintStatus.CANCELLED;
      default:
        throw new Error(`Invalid SprintStatus: ${value}`);
    }
  }

  canTransitionTo(newStatus: SprintStatus): boolean {
    const transitions: Record<string, string[]> = {
      PLANNED: ['ACTIVE', 'CANCELLED'],
      ACTIVE: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [], // Completed is terminal
      CANCELLED: [], // Cancelled is terminal
    };
    return transitions[this.value]?.includes(newStatus.value) ?? false;
  }
}
