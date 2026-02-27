import { SprintId } from '../value-objects/identifier';
import { SprintStatus } from '../value-objects/status';
import { Story } from './story';
import { DomainError } from '../errors/domain-error';
import { DomainEvent } from '../events/domain-event';

export class Sprint {
  private domainEvents: DomainEvent[] = [];

  private constructor(
    public readonly id: SprintId,
    private name: string,
    private goal: string | undefined,
    private status: SprintStatus,
    private startDate: Date | null,
    private endDate: Date | null,
    private stories: Story[],
    public readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(params: {
    id?: SprintId;
    name: string;
    goal?: string;
    startDate?: Date;
    endDate?: Date;
  }): Sprint {
    const id = params.id || SprintId.generate();
    const sprint = new Sprint(
      id,
      params.name,
      params.goal,
      SprintStatus.PLANNED,
      params.startDate || null,
      params.endDate || null,
      [],
      new Date(),
      new Date()
    );

    // Add domain event if needed
    return sprint;
  }

  static reconstitute(params: {
    id: SprintId;
    name: string;
    goal: string | undefined;
    status: SprintStatus;
    startDate: Date | null;
    endDate: Date | null;
    stories: Story[];
    createdAt: Date;
    updatedAt: Date;
  }): Sprint {
    return new Sprint(
      params.id,
      params.name,
      params.goal,
      params.status,
      params.startDate,
      params.endDate,
      params.stories,
      params.createdAt,
      params.updatedAt
    );
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new DomainError('Sprint name cannot be empty');
    }
    this.name = name;
    this.updatedAt = new Date();
  }

  updateGoal(goal: string | undefined): void {
    this.goal = goal;
    this.updatedAt = new Date();
  }

  updateStatus(newStatus: SprintStatus): void {
    if (!this.status.canTransitionTo(newStatus)) {
      throw new DomainError(
        `Cannot transition sprint from ${this.status.toString()} to ${newStatus.toString()}`
      );
    }
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  setDates(startDate: Date, endDate: Date): void {
    if (endDate < startDate) {
      throw new DomainError('End date cannot be before start date');
    }
    this.startDate = startDate;
    this.endDate = endDate;
    this.updatedAt = new Date();
  }

  start(): void {
    if (this.status.getValue() !== 'PLANNED') {
      throw new DomainError('Can only start a planned sprint');
    }
    this.status = SprintStatus.ACTIVE;
    if (!this.startDate) {
      this.startDate = new Date();
    }
    this.updatedAt = new Date();
  }

  complete(): void {
    if (this.status.getValue() !== 'ACTIVE') {
      throw new DomainError('Can only complete an active sprint');
    }
    this.status = SprintStatus.COMPLETED;
    if (!this.endDate) {
      this.endDate = new Date();
    }
    this.updatedAt = new Date();
  }

  cancel(): void {
    if (this.status.getValue() === 'COMPLETED') {
      throw new DomainError('Cannot cancel a completed sprint');
    }
    this.status = SprintStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  addStory(story: Story, order?: number): void {
    if (this.stories.some(s => s.id.equals(story.id))) {
      throw new DomainError('Story is already in this sprint');
    }
    this.stories.push(story);
    this.updatedAt = new Date();
  }

  removeStory(storyId: import('../value-objects/identifier').StoryId): void {
    const index = this.stories.findIndex(s => s.id.equals(storyId));
    if (index === -1) {
      throw new DomainError('Story not found in sprint');
    }
    this.stories.splice(index, 1);
    this.updatedAt = new Date();
  }

  getName(): string {
    return this.name;
  }

  getGoal(): string | undefined {
    return this.goal;
  }

  getStatus(): SprintStatus {
    return this.status;
  }

  getStartDate(): Date | null {
    return this.startDate;
  }

  getEndDate(): Date | null {
    return this.endDate;
  }

  getStories(): readonly Story[] {
    return [...this.stories];
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): readonly DomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }
}
