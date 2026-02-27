/**
 * ConfirmDialog Component
 * 
 * A reusable confirmation dialog component using Modal from the design system.
 * Used for destructive actions like deletion.
 */

'use client';

import { Modal, Button, Text } from '@fabio.caffarello/react-design-system';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  const confirmButtonVariant = variant === 'danger' ? 'error' : 'regular';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={!loading}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </Button>
        </>
      }
    >
      <Text as="p" className="text-gray-700">
        {message}
      </Text>
    </Modal>
  );
}
