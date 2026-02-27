/**
 * Move Card Use Case
 * 
 * Moves a card between columns in a Kanban board.
 * Uses Command Pattern for the move operation.
 */

import type { KanbanBoard } from '@/core/domain/entities/kanban-board';
import { DomainError } from '@/core/domain/errors/domain-error';

export interface MoveCardCommand {
  boardId: string;
  cardId: string;
  targetColumnId: string;
  newOrder?: number;
}

/**
 * Move Card Command
 * 
 * Command Pattern implementation for card movement.
 */
export class MoveCardCommand {
  constructor(
    public readonly boardId: string,
    public readonly cardId: string,
    public readonly targetColumnId: string,
    public readonly newOrder?: number
  ) {}
}

/**
 * Move Card Use Case
 * 
 * Executes the move card command.
 */
export class MoveCardUseCase {
  constructor(
    private getBoard: (id: string) => Promise<KanbanBoard | null>,
    private saveBoard: (board: KanbanBoard) => Promise<KanbanBoard>
  ) {}

  async execute(command: MoveCardCommand): Promise<KanbanBoard> {
    const board = await this.getBoard(command.boardId);

    if (!board) {
      throw new DomainError(`Board ${command.boardId} not found`);
    }

    // Execute move (State Pattern is handled inside KanbanBoard)
    board.moveCard(command.cardId, command.targetColumnId, command.newOrder);

    return await this.saveBoard(board);
  }
}
