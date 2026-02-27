/**
 * StoryCard Component
 * 
 * Componente específico do Motiflow Dashboard para exibir User Stories.
 * Utiliza componentes do design system como base.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Text, Card, Badge } from '@fabio.caffarello/react-design-system';
import Link from 'next/link';
import { StoryDto } from '@/core/application/dtos/story.dto';
import { statusToBadgeVariant, priorityToBadgeVariant } from '@/presentation/utils/badge-mappers';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { deleteStory } from '@/adapters/driving/actions/story.actions';

interface StoryCardProps {
  story: StoryDto;
}

export function StoryCard({ story }: StoryCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteStory(story.id);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting story:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card variant="hover" padding="medium">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <Text as="h3" className="text-lg font-semibold mb-1">
              {story.title}
            </Text>
            <div className="text-sm text-gray-600 mb-2">
              <Text as="span" className="font-medium">As a</Text> {story.as},{' '}
              <Text as="span" className="font-medium">I want</Text> {story.iWant},{' '}
              <Text as="span" className="font-medium">so that</Text> {story.soThat}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Badge variant={statusToBadgeVariant(story.status)}>
              {story.status}
            </Badge>
            <Badge variant={priorityToBadgeVariant(story.priority)}>
              {story.priority}
            </Badge>
          </div>
        </div>
        
        {story.storyPoints && (
          <div className="mb-2">
            <Text as="span" className="text-xs text-gray-500">
              Story Points: <strong>{story.storyPoints}</strong>
            </Text>
          </div>
        )}
        
        {story.epicId && (
          <div className="mb-2">
            <Link href={`/epics/${story.epicId}`}>
              <Text as="span" className="text-xs text-indigo-600 hover:text-indigo-800">
                View Epic →
              </Text>
            </Link>
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-3">
          <Link href={`/stories/${story.id}/edit`}>
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
          <Link href={`/stories/${story.id}`}>
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
        title="Delete Story"
        message={`Are you sure you want to delete "${story.title}"? This action cannot be undone and will also delete all associated tasks.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </>
  );
}
