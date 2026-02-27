import { DomainEvent } from './domain-event';
import { StoryId, EpicId } from '../value-objects/identifier';

export class StoryCreated extends DomainEvent {
  constructor(
    public readonly storyId: StoryId,
    public readonly title: string,
    public readonly epicId: EpicId | null
  ) {
    super(storyId.getValue());
  }

  getEventName(): string {
    return 'StoryCreated';
  }
}
