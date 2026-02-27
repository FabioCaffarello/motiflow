/**
 * Update Card Status Use Case
 * 
 * Updates the status of a card in a Kanban board.
 * Uses State Pattern for state transitions.
 */

import type { KanbanBoard } from '@/core/domain/entities/kanban-board';
import { DomainError } from '@/core/domain/errors/domain-error';
import type { CardState } from '@/core/domain/entities/kanban-board';

export interface UpdateCardStatusCommand {
  boardId: string;
  cardId: string;
  newState: CardState;
}

/**
 * Update Card Status Use Case
 * 
 * Updates card status by moving it to the appropriate column.
 */
export class UpdateCardStatusUseCase {
  constructor(
    private getBoard: (id: string) => Promise<KanbanBoard | null>,
    private saveBoard: (board: KanbanBoard) => Promise<KanbanBoard>
  ) {}

  async execute(command: UpdateCardStatusCommand): Promise<KanbanBoard> {
    const board = await this.getBoard(command.boardId);

    if (!board) {
      throw new DomainError(`Board ${command.boardId} not found`);
    }

    // Find column with matching state
    const targetColumn = board.getColumns().find((col) => col.state === command.newState);
    if (!targetColumn) {
      throw new DomainError(`Column with state ${command.newState} not found`);
    }

    // Move card to target column (State Pattern)
    board.moveCard(command.cardId, targetColumn.id);

    return await this.saveBoard(board);
  }
}
