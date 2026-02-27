import { DomainEvent } from './domain-event';
import { EpicId } from '../value-objects/identifier';

export class EpicCreated extends DomainEvent {
  constructor(
    public readonly epicId: EpicId,
    public readonly title: string
  ) {
    super(epicId.getValue());
  }
}
