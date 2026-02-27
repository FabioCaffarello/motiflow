import { DomainEvent } from './domain-event';
import { TaskId, StoryId } from '../value-objects/identifier';

export class TaskCreated extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly title: string,
    public readonly storyId: StoryId | null
  ) {
    super(taskId.getValue());
  }

  getEventName(): string {
    return 'TaskCreated';
  }
}
