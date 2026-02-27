/**
 * TaskForm Component
 * 
 * Form component for creating and editing Tasks.
 * Uses design system components for consistent UI.
 */

'use client';

import { Input, Textarea, Select, Label, Button } from '@fabio.caffarello/react-design-system';
import { FormHTMLAttributes } from 'react';

export interface TaskFormData {
  title: string;
  description?: string;
  status: string;
  priority: string;
  estimate?: number;
  assignee?: string;
  storyId?: string;
}

export interface TaskFormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  formAction: (formData: FormData) => void | Promise<void>;
  initialData?: Partial<TaskFormData>;
  loading?: boolean;
  error?: string | null;
  submitLabel?: string;
  cancelHref?: string;
  stories?: Array<{ id: string; title: string }>;
}

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'DONE', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export function TaskForm({
  formAction,
  initialData,
  loading = false,
  error = null,
  submitLabel = 'Create Task',
  cancelHref,
  stories = [],
  className = '',
  ...props
}: TaskFormProps) {
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

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" variant="required">
            Title
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g., Implement login API endpoint"
            required
            defaultValue={initialData?.title}
            disabled={loading}
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
            placeholder="Describe the task in detail..."
            defaultValue={initialData?.description}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status" variant="optional">
              Status
            </Label>
            <Select
              id="status"
              name="status"
              options={STATUS_OPTIONS}
              defaultValue={initialData?.status || 'TODO'}
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
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="estimate" variant="optional">
              Estimate (hours)
            </Label>
            <Input
              id="estimate"
              name="estimate"
              type="number"
              min="0"
              step="0.5"
              placeholder="e.g., 4"
              defaultValue={initialData?.estimate?.toString()}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee" variant="optional">
              Assignee
            </Label>
            <Input
              id="assignee"
              name="assignee"
              placeholder="e.g., John Doe"
              defaultValue={initialData?.assignee}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="storyId" variant="optional">
            Story (Optional)
          </Label>
          <Select
            id="storyId"
            name="storyId"
            options={[
              { value: '', label: 'No story' },
              ...stories.map(story => ({ value: story.id, label: story.title }))
            ]}
            defaultValue={initialData?.storyId || ''}
            disabled={loading}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          {cancelHref && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.location.href = cancelHref}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="regular"
            disabled={loading}
          >
            {loading ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
