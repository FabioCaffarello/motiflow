import { DomainEvent } from './domain-event';
import { StoryId } from '../value-objects/identifier';

export class StoryUpdated extends DomainEvent {
  constructor(
    public readonly storyId: StoryId,
    public readonly changes: Record<string, any>
  ) {
    super(storyId.getValue());
  }

  getEventName(): string {
    return 'StoryUpdated';
  }
}
