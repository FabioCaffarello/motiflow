export class AcceptanceCriteria {
  constructor(
    private readonly description: string,
    private readonly testable: boolean = true,
    private satisfied: boolean = false,
    private readonly order: number = 0
  ) {
    if (!description || description.trim().length === 0) {
      throw new Error('Acceptance criteria must have description');
    }
  }

  markAsSatisfied(): AcceptanceCriteria {
    return new AcceptanceCriteria(this.description, this.testable, true, this.order);
  }

  markAsUnsatisfied(): AcceptanceCriteria {
    return new AcceptanceCriteria(this.description, this.testable, false, this.order);
  }

  isSatisfied(): boolean {
    return this.satisfied;
  }

  getDescription(): string {
    return this.description;
  }

  isTestable(): boolean {
    return this.testable;
  }

  getOrder(): number {
    return this.order;
  }

  equals(other: AcceptanceCriteria): boolean {
    return (
      this.description === other.description &&
      this.testable === other.testable &&
      this.order === other.order
    );
  }
}
