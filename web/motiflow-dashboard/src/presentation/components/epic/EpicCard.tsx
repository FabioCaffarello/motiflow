/**
 * EpicCard Component
 * 
 * Componente específico do Motiflow Dashboard para exibir Epics.
 * Utiliza componentes do design system como base.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Text, Badge, Card } from '@fabio.caffarello/react-design-system';
import Link from 'next/link';
import { EpicDto } from '@/core/application/dtos/epic.dto';
import { statusToBadgeVariant, priorityToBadgeVariant } from '@/presentation/utils/badge-mappers';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { deleteEpic } from '@/adapters/driving/actions/epic.actions';

interface EpicCardProps {
  epic: EpicDto;
}

export function EpicCard({ epic }: EpicCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteEpic(epic.id);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting epic:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card variant="hover" padding="medium">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/epics/${epic.id}`}>
            <Text as="h3" className="text-lg font-semibold hover:text-indigo-600">
              {epic.title}
            </Text>
          </Link>
          <div className="flex gap-2">
            <Badge variant={statusToBadgeVariant(epic.status)}>
              {epic.status}
            </Badge>
            <Badge variant={priorityToBadgeVariant(epic.priority)}>
              {epic.priority}
            </Badge>
          </div>
        </div>
        
        {epic.description && (
          <Text as="p" className="text-sm text-gray-600 mb-3 line-clamp-2">
            {epic.description}
          </Text>
        )}
        
        <div className="flex justify-between items-center">
          <Text as="span" className="text-xs text-gray-500">
            {(epic.stories?.length || 0)} stories
          </Text>
          <div className="flex gap-2">
            <Link href={`/epics/${epic.id}/edit`}>
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
            <Link href={`/epics/${epic.id}`}>
              <Button variant="secondary" className="text-sm">
                View
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Epic"
        message={`Are you sure you want to delete "${epic.title}"? This action cannot be undone and will also delete all associated stories and tasks.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </>
  );
}
