export class Priority {
  static readonly LOW = new Priority('LOW');
  static readonly MEDIUM = new Priority('MEDIUM');
  static readonly HIGH = new Priority('HIGH');
  static readonly CRITICAL = new Priority('CRITICAL');

  private static readonly ORDER = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
  };

  private constructor(private readonly value: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') {}

  static fromString(value: string): Priority {
    switch (value) {
      case 'LOW':
        return Priority.LOW;
      case 'MEDIUM':
        return Priority.MEDIUM;
      case 'HIGH':
        return Priority.HIGH;
      case 'CRITICAL':
        return Priority.CRITICAL;
      default:
        throw new Error(`Invalid Priority: ${value}`);
    }
  }

  compare(other: Priority): number {
    return Priority.ORDER[this.value] - Priority.ORDER[other.value];
  }

  isHigherThan(other: Priority): boolean {
    return this.compare(other) > 0;
  }

  isLowerThan(other: Priority): boolean {
    return this.compare(other) < 0;
  }

  equals(other: Priority): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getValue(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    return this.value;
  }
}
