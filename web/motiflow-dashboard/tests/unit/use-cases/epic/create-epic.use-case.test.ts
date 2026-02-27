/**
 * Create Epic Use Case Tests
 * 
 * Unit tests using Test Doubles (Mocks, Stubs).
 */

import { CreateEpicUseCase } from '@/core/application/use-cases/epic/create-epic.use-case';
import { Epic } from '@/core/domain/entities/epic';
import type { EpicRepositoryPort } from '@/core/ports/repositories/epic-repository.port';
import type { EventBusPort } from '@/core/ports/event-bus.port';

// Test Doubles
class MockEpicRepository implements EpicRepositoryPort {
  private epics: Epic[] = [];

  async save(epic: Epic): Promise<Epic> {
    this.epics.push(epic);
    return epic;
  }

  async findById(id: any): Promise<Epic | null> {
    return this.epics.find((e) => e.id.equals(id)) || null;
  }

  async findAll(): Promise<Epic[]> {
    return [...this.epics];
  }

  async delete(id: any): Promise<void> {
    this.epics = this.epics.filter((e) => !e.id.equals(id));
  }
}

class MockEventBus implements EventBusPort {
  private publishedEvents: any[] = [];

  async publish(event: any): Promise<void> {
    this.publishedEvents.push(event);
  }

  subscribe(): void {
    // Mock implementation
  }

  unsubscribe(): void {
    // Mock implementation
  }

  getPublishedEvents(): any[] {
    return [...this.publishedEvents];
  }
}

describe('CreateEpicUseCase', () => {
  let useCase: CreateEpicUseCase;
  let mockRepository: MockEpicRepository;
  let mockEventBus: MockEventBus;

  beforeEach(() => {
    mockRepository = new MockEpicRepository();
    mockEventBus = new MockEventBus();
    useCase = new CreateEpicUseCase(mockRepository, mockEventBus);
  });

  it('should create an epic successfully', async () => {
    const command = {
      title: 'Test Epic',
      description: 'Test Description',
      priority: 'HIGH',
    };

    const epic = await useCase.execute(command);

    expect(epic).toBeDefined();
    expect(epic.getTitle()).toBe('Test Epic');
    expect(epic.getDescription()).toBe('Test Description');
  });

  it('should throw error if title is empty', async () => {
    const command = {
      title: '',
      priority: 'HIGH',
    };

    await expect(useCase.execute(command)).rejects.toThrow('Title is required');
  });

  it('should publish domain events', async () => {
    const command = {
      title: 'Test Epic',
      priority: 'HIGH',
    };

    await useCase.execute(command);

    const events = mockEventBus.getPublishedEvents();
    expect(events.length).toBeGreaterThan(0);
  });
});
