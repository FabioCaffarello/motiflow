'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@fabio.caffarello/react-design-system';
import { startSprint, completeSprint } from '@/adapters/driving/actions/sprint.actions';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { Play, CheckCircle, XCircle } from 'lucide-react';

interface SprintActionsProps {
  sprintId: string;
  status: string;
}

export function SprintActions({ sprintId, status }: SprintActionsProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const result = await startSprint(sprintId);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error starting sprint:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const result = await completeSprint(sprintId);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error completing sprint:', error);
    } finally {
      setIsCompleting(false);
      setShowCompleteDialog(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const result = await cancelSprint(sprintId);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error cancelling sprint:', error);
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        {status === 'PLANNED' && (
          <Button
            variant="primary"
            onClick={handleStart}
            disabled={isStarting}
            isLoading={isStarting}
            leftIcon={<Play className="h-4 w-4" />}
            size="md"
          >
            Start Sprint
          </Button>
        )}

        {status === 'ACTIVE' && (
          <Button
            variant="primary"
            onClick={() => setShowCompleteDialog(true)}
            disabled={isCompleting}
            isLoading={isCompleting}
            leftIcon={<CheckCircle className="h-4 w-4" />}
            size="md"
          >
            Complete Sprint
          </Button>
        )}

        {status !== 'COMPLETED' && status !== 'CANCELLED' && (
          <Button
            variant="error"
            onClick={() => {
              // TODO: Implement cancel sprint action
              console.log('Cancel sprint');
            }}
            leftIcon={<XCircle className="h-4 w-4" />}
            size="md"
          >
            Cancel Sprint
          </Button>
        )}
      </div>

      <ConfirmDialog
        isOpen={showCompleteDialog}
        onClose={() => setShowCompleteDialog(false)}
        onConfirm={handleComplete}
        title="Complete Sprint"
        message="Are you sure you want to complete this sprint? This action will mark all remaining stories and generate a sprint report."
        confirmLabel="Complete"
        cancelLabel="Cancel"
        variant="default"
        loading={isCompleting}
      />

      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancel}
        title="Cancel Sprint"
        message="Are you sure you want to cancel this sprint? This action cannot be undone."
        confirmLabel="Cancel Sprint"
        cancelLabel="Keep Sprint"
        variant="danger"
        loading={isCancelling}
      />
    </>
  );
}
