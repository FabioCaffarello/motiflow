import { StoryId, EpicId } from '../value-objects/identifier';
import { StoryStatus } from '../value-objects/status';
import { Priority } from '../value-objects/priority';
import { StoryPoints } from '../value-objects/story-points';
import { AcceptanceCriteria } from '../value-objects/acceptance-criteria';
import { Task } from './task';
import { DomainError } from '../errors/domain-error';
import { DomainEvent } from '../events/domain-event';
import { StoryCreated } from '../events/story-created.event';
import { StoryUpdated } from '../events/story-updated.event';

export class Story {
  private domainEvents: DomainEvent[] = [];

  private constructor(
    public readonly id: StoryId,
    private title: string,
    private description: string | undefined,
    private as: string,
    private iWant: string,
    private soThat: string,
    private acceptanceCriteria: AcceptanceCriteria[],
    private storyPoints: StoryPoints | null,
    private status: StoryStatus,
    private priority: Priority,
    private tasks: Task[],
    private epicId: EpicId | null,
    public readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(params: {
    id?: StoryId;
    title: string;
    description?: string;
    as: string;
    iWant: string;
    soThat: string;
    acceptanceCriteria?: AcceptanceCriteria[];
    storyPoints?: StoryPoints;
    priority?: Priority;
  }): Story {
    if (!params.as || !params.iWant || !params.soThat) {
      throw new DomainError('User story must have "as", "iWant", and "soThat" fields');
    }

    const id = params.id || StoryId.generate();
    return new Story(
      id,
      params.title,
      params.description,
      params.as,
      params.iWant,
      params.soThat,
      params.acceptanceCriteria || [],
      params.storyPoints || null,
      StoryStatus.BACKLOG,
      params.priority || Priority.MEDIUM,
      [],
      null,
      new Date(),
      new Date()
    );
  }

  static reconstitute(params: {
    id: StoryId;
    title: string;
    description?: string;
    as: string;
    iWant: string;
    soThat: string;
    acceptanceCriteria: AcceptanceCriteria[];
    storyPoints: StoryPoints | null;
    status: StoryStatus;
    priority: Priority;
    tasks: Task[];
    epicId: EpicId | null;
    createdAt: Date;
    updatedAt: Date;
  }): Story {
    return new Story(
      params.id,
      params.title,
      params.description,
      params.as,
      params.iWant,
      params.soThat,
      params.acceptanceCriteria,
      params.storyPoints,
      params.status,
      params.priority,
      params.tasks,
      params.epicId,
      params.createdAt,
      params.updatedAt
    );
  }

  linkToEpic(epicId: EpicId): void {
    if (this.epicId && this.epicId.equals(epicId)) {
      return; // Already linked
    }

    if (this.epicId && !this.epicId.equals(epicId)) {
      throw new DomainError('Story is already linked to another epic');
    }

    this.epicId = epicId;
    this.updatedAt = new Date();
  }

  unlinkFromEpic(): void {
    this.epicId = null;
    this.updatedAt = new Date();
  }

  addTask(task: Task): void {
    if (this.tasks.some(t => t.id.equals(task.id))) {
      throw new DomainError('Task is already in this story');
    }

    task.linkToStory(this.id);
    this.tasks.push(task);
    this.updatedAt = new Date();
  }

  removeTask(taskId: import('../value-objects/identifier').TaskId): void {
    const index = this.tasks.findIndex(t => t.id.equals(taskId));
    if (index === -1) {
      throw new DomainError('Task not found in story');
    }

    this.tasks[index].unlinkFromStory();
    this.tasks.splice(index, 1);
    this.updatedAt = new Date();
  }

  updateAcceptanceCriteria(criteria: AcceptanceCriteria[]): void {
    if (criteria.length === 0) {
      throw new DomainError('Story must have at least one acceptance criteria');
    }
    this.acceptanceCriteria = criteria;
    this.updatedAt = new Date();
  }

  updateStatus(newStatus: StoryStatus): void {
    if (!this.status.canTransitionTo(newStatus)) {
      throw new DomainError(`Cannot transition from ${this.status.toString()} to ${newStatus.toString()}`);
    }
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  updateStoryPoints(points: StoryPoints | null): void {
    this.storyPoints = points;
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

  updateAs(as: string): void {
    if (!as || as.trim().length === 0) {
      throw new DomainError('"As" field cannot be empty');
    }
    this.as = as;
    this.updatedAt = new Date();
  }

  updateIWant(iWant: string): void {
    if (!iWant || iWant.trim().length === 0) {
      throw new DomainError('"I want" field cannot be empty');
    }
    this.iWant = iWant;
    this.updatedAt = new Date();
  }

  updateSoThat(soThat: string): void {
    if (!soThat || soThat.trim().length === 0) {
      throw new DomainError('"So that" field cannot be empty');
    }
    this.soThat = soThat;
    this.updatedAt = new Date();
  }

  updatePriority(priority: Priority): void {
    this.priority = priority;
    this.updatedAt = new Date();
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  getAs(): string {
    return this.as;
  }

  getIWant(): string {
    return this.iWant;
  }

  getSoThat(): string {
    return this.soThat;
  }

  getAcceptanceCriteria(): readonly AcceptanceCriteria[] {
    return [...this.acceptanceCriteria];
  }

  getStoryPoints(): StoryPoints | null {
    return this.storyPoints;
  }

  getStatus(): StoryStatus {
    return this.status;
  }

  getPriority(): Priority {
    return this.priority;
  }

  getTasks(): readonly Task[] {
    return [...this.tasks];
  }

  getEpicId(): EpicId | null {
    return this.epicId;
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
