/**
 * Kanban Board Entity
 * 
 * Represents a Kanban board with columns and cards.
 * Uses State Pattern for card states and Aggregate Pattern (board is aggregate root).
 */

import { DomainError } from '../errors/domain-error';
import { DomainEvent } from '../events/domain-event';

export type KanbanColumnId = string;
export type KanbanCardId = string;

export type CardState = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface KanbanCard {
  id: KanbanCardId;
  title: string;
  description?: string;
  state: CardState;
  storyId?: string;
  taskId?: string;
  assignee?: string;
  priority?: string;
  order: number;
}

export interface KanbanColumn {
  id: KanbanColumnId;
  name: string;
  state: CardState;
  cards: KanbanCard[];
  order: number;
}

/**
 * Kanban Board Entity
 * 
 * Aggregate root for Kanban board.
 * Manages columns and cards.
 */
export class KanbanBoard {
  private domainEvents: DomainEvent[] = [];

  private constructor(
    public readonly id: string,
    private name: string,
    private columns: KanbanColumn[],
    public readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(name: string, columns?: KanbanColumn[]): KanbanBoard {
    const defaultColumns: KanbanColumn[] = columns || [
      { id: 'backlog', name: 'Backlog', state: 'BACKLOG', cards: [], order: 0 },
      { id: 'todo', name: 'To Do', state: 'TODO', cards: [], order: 1 },
      { id: 'in-progress', name: 'In Progress', state: 'IN_PROGRESS', cards: [], order: 2 },
      { id: 'review', name: 'Review', state: 'REVIEW', cards: [], order: 3 },
      { id: 'done', name: 'Done', state: 'DONE', cards: [], order: 4 },
    ];

    return new KanbanBoard(
      `kanban-${Date.now()}`,
      name,
      defaultColumns,
      new Date(),
      new Date()
    );
  }

  getName(): string {
    return this.name;
  }

  getColumns(): readonly KanbanColumn[] {
    return [...this.columns];
  }

  getColumn(columnId: KanbanColumnId): KanbanColumn | undefined {
    return this.columns.find((col) => col.id === columnId);
  }

  getCard(cardId: KanbanCardId): { card: KanbanCard; column: KanbanColumn } | null {
    for (const column of this.columns) {
      const card = column.cards.find((c) => c.id === cardId);
      if (card) {
        return { card, column };
      }
    }
    return null;
  }

  /**
   * Add card to a column
   */
  addCard(columnId: KanbanColumnId, card: KanbanCard): void {
    const column = this.columns.find((col) => col.id === columnId);
    if (!column) {
      throw new DomainError(`Column ${columnId} not found`);
    }

    // Check if card already exists
    if (this.getCard(card.id)) {
      throw new DomainError(`Card ${card.id} already exists`);
    }

    column.cards.push(card);
    this.updatedAt = new Date();
  }

  /**
   * Move card between columns (State Pattern)
   */
  moveCard(cardId: KanbanCardId, targetColumnId: KanbanColumnId, newOrder?: number): void {
    const cardLocation = this.getCard(cardId);
    if (!cardLocation) {
      throw new DomainError(`Card ${cardId} not found`);
    }

    const targetColumn = this.columns.find((col) => col.id === targetColumnId);
    if (!targetColumn) {
      throw new DomainError(`Target column ${targetColumnId} not found`);
    }

    // Remove from source column
    const sourceColumn = cardLocation.column;
    sourceColumn.cards = sourceColumn.cards.filter((c) => c.id !== cardId);

    // Update card state based on target column
    const updatedCard: KanbanCard = {
      ...cardLocation.card,
      state: targetColumn.state,
      order: newOrder ?? targetColumn.cards.length,
    };

    // Add to target column
    targetColumn.cards.push(updatedCard);
    targetColumn.cards.sort((a, b) => a.order - b.order);

    this.updatedAt = new Date();
  }

  /**
   * Update card order within a column
   */
  updateCardOrder(cardId: KanbanCardId, newOrder: number): void {
    const cardLocation = this.getCard(cardId);
    if (!cardLocation) {
      throw new DomainError(`Card ${cardId} not found`);
    }

    const column = cardLocation.column;
    const card = cardLocation.card;

    // Remove card
    column.cards = column.cards.filter((c) => c.id !== cardId);

    // Update order
    card.order = newOrder;

    // Re-insert at new position
    column.cards.push(card);
    column.cards.sort((a, b) => a.order - b.order);

    this.updatedAt = new Date();
  }

  /**
   * Remove card from board
   */
  removeCard(cardId: KanbanCardId): void {
    const cardLocation = this.getCard(cardId);
    if (!cardLocation) {
      throw new DomainError(`Card ${cardId} not found`);
    }

    const column = cardLocation.column;
    column.cards = column.cards.filter((c) => c.id !== cardId);
    this.updatedAt = new Date();
  }

  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
