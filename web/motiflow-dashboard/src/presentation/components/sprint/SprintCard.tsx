/**
 * SprintCard Component
 * 
 * Component for displaying Sprint information in a card format.
 * Uses design system components.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Text, Card, Badge } from '@fabio.caffarello/react-design-system';
import Link from 'next/link';
import { SprintDto } from '@/core/application/dtos/sprint.dto';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { deleteSprint } from '@/adapters/driving/actions/sprint.actions';
import { statusToBadgeVariant } from '@/presentation/utils/badge-mappers';

interface SprintCardProps {
  sprint: SprintDto;
}

export function SprintCard({ sprint }: SprintCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSprint(sprint.id);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting sprint:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Card variant="hover" padding="medium">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/sprints/${sprint.id}`}>
            <Text as="h3" className="text-lg font-semibold hover:text-indigo-600">
              {sprint.name}
            </Text>
          </Link>
          <Badge variant={statusToBadgeVariant(sprint.status)}>
            {sprint.status}
          </Badge>
        </div>
        
        {sprint.goal && (
          <Text as="p" className="text-sm text-gray-600 mb-3 line-clamp-2">
            {sprint.goal}
          </Text>
        )}
        
        <div className="flex justify-between items-center mb-2">
          <Text as="span" className="text-xs text-gray-500">
            {sprint.stories.length} stories
          </Text>
          {sprint.startDate && sprint.endDate && (
            <Text as="span" className="text-xs text-gray-500">
              {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
            </Text>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-3">
          <Link href={`/sprints/${sprint.id}/edit`}>
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
          <Link href={`/sprints/${sprint.id}`}>
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
        title="Delete Sprint"
        message={`Are you sure you want to delete "${sprint.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </>
  );
}
