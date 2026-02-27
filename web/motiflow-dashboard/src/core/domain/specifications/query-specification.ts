/**
 * Query Specification Pattern
 * 
 * Specification Pattern for complex queries and validations.
 * Allows composition of query conditions in a flexible way.
 */

/**
 * Specification interface
 */
export interface Specification<T> {
  isSatisfiedBy(entity: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

/**
 * Base Specification class
 */
export abstract class BaseSpecification<T> implements Specification<T> {
  abstract isSatisfiedBy(entity: T): boolean;

  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

/**
 * And Specification (composite)
 */
class AndSpecification<T> extends BaseSpecification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return this.left.isSatisfiedBy(entity) && this.right.isSatisfiedBy(entity);
  }
}

/**
 * Or Specification (composite)
 */
class OrSpecification<T> extends BaseSpecification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return this.left.isSatisfiedBy(entity) || this.right.isSatisfiedBy(entity);
  }
}

/**
 * Not Specification
 */
class NotSpecification<T> extends BaseSpecification<T> {
  constructor(private spec: Specification<T>) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return !this.spec.isSatisfiedBy(entity);
  }
}

/**
 * Example: Epic Status Specification
 */
export class EpicStatusSpecification extends BaseSpecification<any> {
  constructor(private status: string) {
    super();
  }

  isSatisfiedBy(epic: { status: { getValue: () => string } }): boolean {
    return epic.status.getValue() === this.status;
  }
}

/**
 * Example: Epic Priority Specification
 */
export class EpicPrioritySpecification extends BaseSpecification<any> {
  constructor(private priority: string) {
    super();
  }

  isSatisfiedBy(epic: { priority: { getValue: () => string } }): boolean {
    return epic.priority.getValue() === this.priority;
  }
}

/**
 * Example: Story Points Range Specification
 */
export class StoryPointsRangeSpecification extends BaseSpecification<any> {
  constructor(
    private min: number,
    private max: number
  ) {
    super();
  }

  isSatisfiedBy(story: { storyPoints: { getValue: () => number } | null }): boolean {
    const points = story.storyPoints?.getValue() || 0;
    return points >= this.min && points <= this.max;
  }
}
