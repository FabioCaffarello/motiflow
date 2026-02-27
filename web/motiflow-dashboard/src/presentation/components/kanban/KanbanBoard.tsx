'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, Text, Badge } from '@fabio.caffarello/react-design-system';
import { getKanbanBoard, moveCard } from '@/adapters/driving/actions/kanban.actions';
import { Loader2 } from 'lucide-react';

interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  state: string;
  storyId?: string;
  taskId?: string;
  assignee?: string;
  priority?: string;
  order: number;
}

interface KanbanColumn {
  id: string;
  name: string;
  state: string;
  cards: KanbanCard[];
  order: number;
}

interface KanbanBoardData {
  id: string;
  name: string;
  columns: KanbanColumn[];
}

function KanbanCardComponent({ card }: { card: KanbanCard }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <Text as="h4" className="font-semibold text-sm">
          {card.title}
        </Text>
        {card.priority && (
          <Badge variant={card.priority === 'HIGH' ? 'error' : 'default'}>
            {card.priority}
          </Badge>
        )}
      </div>
      {card.description && (
        <Text as="p" className="text-xs text-gray-600 mb-2">
          {card.description}
        </Text>
      )}
      {card.assignee && (
        <div className="text-xs text-gray-500">
          👤 {card.assignee}
        </div>
      )}
    </div>
  );
}

function KanbanColumnComponent({ column }: { column: KanbanColumn }) {
  const {
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: column.id,
    data: {
      type: 'column',
      columnId: column.id,
      column: column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardIds = column.cards.map(card => card.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={column.id}
      data-column-id={column.id}
      className="flex-1 min-w-[280px] bg-gray-50 rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <Text as="h3" className="font-semibold text-gray-700">
          {column.name}
        </Text>
        <Badge variant="default">{column.cards.length}</Badge>
      </div>
      <SortableContext
        items={cardIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 min-h-[200px]">
          {column.cards.map((card) => (
            <KanbanCardComponent key={card.id} card={card} />
          ))}
          {column.cards.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-8">
              No cards
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoardComponent() {
  const [board, setBoard] = useState<KanbanBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadBoard();
  }, []);

  const loadBoard = async () => {
    try {
      setLoading(true);
      const result = await getKanbanBoard();
      if (result.success) {
        setBoard(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !board) return;

    const activeCard = findCardById(active.id as string);
    if (!activeCard) return;

    // Find the column - over.id might be a card or a column
    let overColumn: KanbanColumn | null = null;
    
    // First, try to find column by ID directly
    overColumn = findColumnById(over.id as string);
    
    // If not found, the over.id might be a card - find its column
    if (!overColumn) {
      const overCard = findCardById(over.id as string);
      if (overCard) {
        overColumn = board.columns.find(col => col.state === overCard.state) || null;
      }
    }

    // If still not found, try to find by data attribute (for drop zones)
    if (!overColumn && over.data.current) {
      const columnId = over.data.current.columnId || over.data.current.id;
      if (columnId) {
        overColumn = findColumnById(columnId);
      }
    }

    if (!overColumn) return;

    // Don't do anything if dropped in the same column
    if (activeCard.state === overColumn.state) return;

    // Move card
    const result = await moveCard(
      board.id,
      activeCard.id,
      overColumn.id
    );

    if (result.success) {
      // Reload board to get updated state
      await loadBoard();
    } else {
      setError(result.error);
    }
  };

  const findCardById = (cardId: string): KanbanCard | null => {
    if (!board) return null;
    for (const column of board.columns) {
      const card = column.cards.find(c => c.id === cardId);
      if (card) return card;
    }
    return null;
  };

  const findColumnById = (columnId: string): KanbanColumn | null => {
    if (!board) return null;
    return board.columns.find(col => col.id === columnId) || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <Text className="text-red-800">{error}</Text>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="text-center py-8">
        <Text>No board found</Text>
      </div>
    );
  }

  const allCardIds = board.columns.flatMap(col => col.cards.map(c => c.id));
  const activeCard = activeId ? findCardById(activeId) : null;

  return (
    <div className="h-full">
      <div className="mb-6">
        <Text as="h1" className="text-2xl font-bold text-gray-900">
          {board.name}
        </Text>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <KanbanColumnComponent key={column.id} column={column} />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 w-64">
              <Text as="h4" className="font-semibold text-sm">
                {activeCard.title}
              </Text>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
