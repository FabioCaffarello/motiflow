import { DomainEvent } from './domain-event';
import { TaskId } from '../value-objects/identifier';

export class TaskUpdated extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly changes: Record<string, any>
  ) {
    super(taskId.getValue());
  }

  getEventName(): string {
    return 'TaskUpdated';
  }
}
