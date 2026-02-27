import { EpicId, StoryId } from '../value-objects/identifier';
import { EpicStatus, StoryStatus } from '../value-objects/status';
import { Priority } from '../value-objects/priority';
import { Story } from './story';
import { EpicCreated } from '../events/epic-created.event';
import { DomainError } from '../errors/domain-error';
import { DomainEvent } from '../events/domain-event';

export class Epic {
  private domainEvents: DomainEvent[] = [];

  private constructor(
    public readonly id: EpicId,
    private title: string,
    private description: string | undefined,
    private status: EpicStatus,
    private priority: Priority,
    private stories: Story[],
    public readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(params: {
    id?: EpicId;
    title: string;
    description?: string;
    priority?: Priority;
  }): Epic {
    const id = params.id || EpicId.generate();
    const epic = new Epic(
      id,
      params.title,
      params.description,
      EpicStatus.DRAFT,
      params.priority || Priority.MEDIUM,
      [],
      new Date(),
      new Date()
    );

    epic.addDomainEvent(new EpicCreated(id, params.title));
    return epic;
  }

  static reconstitute(params: {
    id: EpicId;
    title: string;
    description?: string;
    status: EpicStatus;
    priority: Priority;
    stories: Story[];
    createdAt: Date;
    updatedAt: Date;
  }): Epic {
    return new Epic(
      params.id,
      params.title,
      params.description,
      params.status,
      params.priority,
      params.stories,
      params.createdAt,
      params.updatedAt
    );
  }

  addStory(story: Story): void {
    if (story.epicId && !story.epicId.equals(this.id)) {
      throw new DomainError('Story is already linked to another epic');
    }

    if (this.stories.some(s => s.id.equals(story.id))) {
      throw new DomainError('Story is already in this epic');
    }

    story.linkToEpic(this.id);
    this.stories.push(story);
    this.updatedAt = new Date();
  }

  removeStory(storyId: import('../value-objects/identifier').StoryId): void {
    const index = this.stories.findIndex(s => s.id.equals(storyId));
    if (index === -1) {
      throw new DomainError('Story not found in epic');
    }

    this.stories[index].unlinkFromEpic();
    this.stories.splice(index, 1);
    this.updatedAt = new Date();
  }

  updateStatus(newStatus: EpicStatus): void {
    if (!this.status.canTransitionTo(newStatus)) {
      throw new DomainError(`Cannot transition from ${this.status.toString()} to ${newStatus.toString()}`);
    }

    if (newStatus.equals(EpicStatus.COMPLETED)) {
      const incompleteStories = this.stories.filter(s => !s.status.equals(StoryStatus.DONE));
      if (incompleteStories.length > 0) {
        throw new DomainError('Cannot complete epic with incomplete stories');
      }
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

  getStatus(): EpicStatus {
    return this.status;
  }

  getPriority(): Priority {
    return this.priority;
  }

  getStories(): readonly Story[] {
    return [...this.stories];
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  private validateInvariants(): void {
    // Epic não pode ter stories duplicadas
    const storyIds = new Set(this.stories.map(s => s.id.getValue()));
    if (storyIds.size !== this.stories.length) {
      throw new DomainError('Epic cannot have duplicate stories');
    }

    // Epic deve ter pelo menos uma story quando status != 'draft'
    if (!this.status.equals(EpicStatus.DRAFT) && this.stories.length === 0) {
      throw new DomainError('Epic must have at least one story when not in draft');
    }
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
