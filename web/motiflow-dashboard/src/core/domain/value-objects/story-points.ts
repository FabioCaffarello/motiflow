export class StoryPoints {
  private static readonly VALID_POINTS = [1, 2, 3, 5, 8, 13, 21];

  private constructor(private readonly value: number) {
    if (!StoryPoints.VALID_POINTS.includes(value)) {
      throw new Error(`Invalid story points: ${value}. Must be one of: ${StoryPoints.VALID_POINTS.join(', ')}`);
    }
  }

  static create(value: number): StoryPoints {
    return new StoryPoints(value);
  }

  static fromNumber(value: number | null | undefined): StoryPoints | null {
    if (value === null || value === undefined) {
      return null;
    }
    return new StoryPoints(value);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: StoryPoints): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }
}
