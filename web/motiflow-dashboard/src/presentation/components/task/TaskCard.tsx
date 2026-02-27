/**
 * TaskCard Component
 * 
 * Componente específico do Motiflow Dashboard para exibir Tasks.
 * Utiliza componentes do design system como base.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Text, Card, Badge } from '@fabio.caffarello/react-design-system';
import Link from 'next/link';
import { TaskDto } from '@/core/application/dtos/task.dto';
import { statusToBadgeVariant, priorityToBadgeVariant } from '@/presentation/utils/badge-mappers';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { deleteTask } from '@/adapters/driving/actions/task.actions';

interface TaskCardProps {
  task: TaskDto;
}

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteTask(task.id);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card variant="hover" padding="medium">
        <div className="flex justify-between items-start mb-2">
          <Text as="h3" className="text-lg font-semibold">
            {task.title}
          </Text>
          <div className="flex gap-2 ml-4">
            <Badge variant={statusToBadgeVariant(task.status)}>
              {task.status}
            </Badge>
            <Badge variant={priorityToBadgeVariant(task.priority)}>
              {task.priority}
            </Badge>
          </div>
        </div>
        
        {task.description && (
          <Text as="p" className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </Text>
        )}
        
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-4 text-xs text-gray-500">
            {task.estimate && (
              <Text as="span">Estimate: <strong>{task.estimate}h</strong></Text>
            )}
            {task.assignee && (
              <Text as="span">Assignee: <strong>{task.assignee}</strong></Text>
            )}
          </div>
        </div>
        
        {task.storyId && (
          <div className="mb-2">
            <Link href={`/stories/${task.storyId}`}>
              <Text as="span" className="text-xs text-indigo-600 hover:text-indigo-800">
                View Story →
              </Text>
            </Link>
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-3">
          <Link href={`/tasks/${task.id}/edit`}>
            <Button variant="secondary" className="text-sm">
              Edit
            </Button>
          </Link>
          <Button
            variant="error"
            className="text-sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </Button>
          <Link href={`/tasks/${task.id}`}>
            <Button variant="secondary" className="text-sm">
              View
            </Button>
          </Link>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </>
  );
}
