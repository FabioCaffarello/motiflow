import { DomainError } from '../errors/domain-error';

/**
 * TimeEstimate Value Object
 * 
 * Represents a time estimate in hours for tasks.
 * Validates that estimates are positive numbers.
 */
export class TimeEstimate {
  private constructor(private readonly hours: number) {
    if (hours <= 0) {
      throw new DomainError('Time estimate must be a positive number');
    }
    
    if (hours > 1000) {
      throw new DomainError('Time estimate cannot exceed 1000 hours');
    }
  }

  static create(hours: number): TimeEstimate {
    return new TimeEstimate(hours);
  }

  static fromNumber(hours: number | null | undefined): TimeEstimate | null {
    if (hours === null || hours === undefined) {
      return null;
    }
    return new TimeEstimate(hours);
  }

  getValue(): number {
    return this.hours;
  }

  equals(other: TimeEstimate): boolean {
    return this.hours === other.hours;
  }

  isGreaterThan(other: TimeEstimate): boolean {
    return this.hours > other.hours;
  }

  isLessThan(other: TimeEstimate): boolean {
    return this.hours < other.hours;
  }

  toString(): string {
    return `${this.hours}h`;
  }
}
