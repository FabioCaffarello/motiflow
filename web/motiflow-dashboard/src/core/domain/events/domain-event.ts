export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly aggregateId: string;

  constructor(aggregateId: string) {
    this.occurredOn = new Date();
    this.aggregateId = aggregateId;
  }
}
