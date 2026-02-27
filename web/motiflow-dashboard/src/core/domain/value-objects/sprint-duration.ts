import { DomainError } from '../errors/domain-error';

/**
 * SprintDuration Value Object
 * 
 * Represents the duration of a sprint in days.
 * Validates that sprint duration is within acceptable range (typically 1-4 weeks).
 */
export class SprintDuration {
  private static readonly MIN_DAYS = 1;
  private static readonly MAX_DAYS = 28; // 4 weeks

  private constructor(private readonly days: number) {
    if (days < SprintDuration.MIN_DAYS || days > SprintDuration.MAX_DAYS) {
      throw new DomainError(
        `Sprint duration must be between ${SprintDuration.MIN_DAYS} and ${SprintDuration.MAX_DAYS} days`
      );
    }
  }

  static create(days: number): SprintDuration {
    return new SprintDuration(days);
  }

  static createWeeks(weeks: number): SprintDuration {
    return new SprintDuration(weeks * 7);
  }

  static createStandard(): SprintDuration {
    return new SprintDuration(14); // 2 weeks default
  }

  getDays(): number {
    return this.days;
  }

  getWeeks(): number {
    return Math.round((this.days / 7) * 10) / 10; // Round to 1 decimal
  }

  equals(other: SprintDuration): boolean {
    return this.days === other.days;
  }

  isLongerThan(other: SprintDuration): boolean {
    return this.days > other.days;
  }

  isShorterThan(other: SprintDuration): boolean {
    return this.days < other.days;
  }

  toString(): string {
    if (this.days === 7) {
      return '1 week';
    }
    if (this.days === 14) {
      return '2 weeks';
    }
    if (this.days === 21) {
      return '3 weeks';
    }
    if (this.days === 28) {
      return '4 weeks';
    }
    return `${this.days} days`;
  }
}
