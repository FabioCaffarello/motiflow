import { TaskId, StoryId } from '../value-objects/identifier';
import { TaskStatus } from '../value-objects/status';
import { Priority } from '../value-objects/priority';
import { DomainError } from '../errors/domain-error';
import { DomainEvent } from '../events/domain-event';
import { TaskCreated } from '../events/task-created.event';
import { TaskUpdated } from '../events/task-updated.event';

export class Task {
  private domainEvents: DomainEvent[] = [];

  private constructor(
    public readonly id: TaskId,
    private title: string,
    private description: string | undefined,
    private status: TaskStatus,
    private priority: Priority,
    private estimate: number | null,
    private assignee: string | null,
    private storyId: StoryId | null,
    public readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(params: {
    id?: TaskId;
    title: string;
    description?: string;
    priority?: Priority;
    estimate?: number;
    assignee?: string;
  }): Task {
    const id = params.id || TaskId.generate();
    const task = new Task(
      id,
      params.title,
      params.description,
      TaskStatus.TODO,
      params.priority || Priority.MEDIUM,
      params.estimate || null,
      params.assignee || null,
      null,
      new Date(),
      new Date()
    );

    task.addDomainEvent(new TaskCreated(id, params.title, null));
    return task;
  }

  static reconstitute(params: {
    id: TaskId;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: Priority;
    estimate: number | null;
    assignee: string | null;
    storyId: StoryId | null;
    createdAt: Date;
    updatedAt: Date;
  }): Task {
    return new Task(
      params.id,
      params.title,
      params.description,
      params.status,
      params.priority,
      params.estimate,
      params.assignee,
      params.storyId,
      params.createdAt,
      params.updatedAt
    );
  }

  linkToStory(storyId: StoryId): void {
    if (this.storyId && this.storyId.equals(storyId)) {
      return; // Already linked
    }

    if (this.storyId && !this.storyId.equals(storyId)) {
      throw new DomainError('Task is already linked to another story');
    }

    this.storyId = storyId;
    this.updatedAt = new Date();
  }

  unlinkFromStory(): void {
    this.storyId = null;
    this.updatedAt = new Date();
  }

  complete(): void {
    if (!this.status.canTransitionTo(TaskStatus.DONE)) {
      throw new DomainError(`Cannot complete task in status ${this.status.toString()}`);
    }
    this.status = TaskStatus.DONE;
    this.updatedAt = new Date();
  }

  assign(assignee: string): void {
    if (!assignee || assignee.trim().length === 0) {
      throw new DomainError('Assignee cannot be empty');
    }
    this.assignee = assignee;
    this.updatedAt = new Date();
  }

  updateStatus(newStatus: TaskStatus): void {
    if (!this.status.canTransitionTo(newStatus)) {
      throw new DomainError(`Cannot transition from ${this.status.toString()} to ${newStatus.toString()}`);
    }
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  updateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new DomainError('Title cannot be empty');
    }
    this.title = title;
    this.updatedAt = new Date();
  }

  updateDescription(description: string | undefined): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  updateEstimate(estimate: number | null): void {
    if (estimate !== null && estimate <= 0) {
      throw new DomainError('Estimate must be positive');
    }
    this.estimate = estimate;
    this.updatedAt = new Date();
  }

  updatePriority(priority: Priority): void {
    this.priority = priority;
    this.updatedAt = new Date();
  }

  unassign(): void {
    this.assignee = null;
    this.updatedAt = new Date();
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  getPriority(): Priority {
    return this.priority;
  }

  getEstimate(): number | null {
    return this.estimate;
  }

  getAssignee(): string | null {
    return this.assignee;
  }

  getStoryId(): StoryId | null {
    return this.storyId;
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
