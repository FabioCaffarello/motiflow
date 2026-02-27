/**
 * EpicForm Component
 * 
 * Form component for creating and editing Epics.
 * Uses design system components for consistent UI.
 */

'use client';

import { Input, Textarea, Select, Label, Button, getSpacingClass } from '@fabio.caffarello/react-design-system';
import { FormHTMLAttributes } from 'react';

export interface EpicFormData {
  title: string;
  description?: string;
  status?: string;
  priority: string;
}

export interface EpicFormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  formAction: (formData: FormData) => void | Promise<void>;
  initialData?: Partial<EpicFormData>;
  loading?: boolean;
  error?: string | null;
  submitLabel?: string;
  cancelHref?: string;
}

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export function EpicForm({
  formAction,
  initialData,
  loading = false,
  error = null,
  submitLabel = 'Create Epic',
  cancelHref,
  className = '',
  ...props
}: EpicFormProps) {
  return (
    <form
      action={formAction}
      className={`space-y-4 max-w-2xl ${className}`}
      noValidate
      {...props}
    >
      {error && (
        <div
          role="alert"
          className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded"
        >
          {error}
        </div>
      )}

      <div className={`space-y-4 ${getSpacingClass('md', 'm', 'y')}`}>
        <div className="space-y-2">
          <Label htmlFor="title" variant="required">
            Title
          </Label>
          <Input
            id="title"
            name="title"
            label="Title"
            placeholder="e.g., User Authentication System"
            required
            defaultValue={initialData?.title}
            disabled={loading}
            variant="outlined"
            size="md"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" variant="optional">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe the epic and its goals..."
            defaultValue={initialData?.description}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" variant="optional">
            Status
          </Label>
          <Select
            id="status"
            name="status"
            options={STATUS_OPTIONS}
            defaultValue={initialData?.status || 'DRAFT'}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority" variant="optional">
            Priority
          </Label>
          <Select
            id="priority"
            name="priority"
            options={PRIORITY_OPTIONS}
            defaultValue={initialData?.priority || 'MEDIUM'}
            disabled={loading}
          />
        </div>

        <div className={`flex justify-end gap-4 ${getSpacingClass('md', 'p', 't')}`}>
          {cancelHref && (
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.href = cancelHref}
              disabled={loading}
              size="md"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="regular"
            disabled={loading}
            isLoading={loading}
            size="md"
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
