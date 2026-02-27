export class Identifier {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Identifier cannot be empty');
    }
  }

  static create(value: string): Identifier {
    return new Identifier(value);
  }

  static generate(): Identifier {
    // Using cuid-like generation (in production, use proper cuid library)
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return new Identifier(`${timestamp}-${random}`);
  }

  equals(other: Identifier): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }
}

// Type aliases for type safety
export type EpicId = Identifier;
export type StoryId = Identifier;
export type TaskId = Identifier;
export type SprintId = Identifier;
export type ADRId = Identifier;

// Export classes as values to allow static method calls (EpicId.create(), etc.)
// This allows both type safety and runtime usage
export const EpicId = Identifier;
export const StoryId = Identifier;
export const TaskId = Identifier;
export const SprintId = Identifier;
export const ADRId = Identifier;
