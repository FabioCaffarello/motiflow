/**
 * StoryForm Component
 * 
 * Form component for creating and editing Stories.
 * Uses design system components for consistent UI.
 */

'use client';

import { Input, Textarea, Select, Label, Button } from '@fabio.caffarello/react-design-system';
import { FormHTMLAttributes, useState } from 'react';

export interface StoryFormData {
  title: string;
  description?: string;
  as: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria?: string[];
  storyPoints?: number;
  status: string;
  priority: string;
  epicId?: string;
}

export interface StoryFormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  formAction: (formData: FormData) => void | Promise<void>;
  initialData?: Partial<StoryFormData>;
  loading?: boolean;
  error?: string | null;
  submitLabel?: string;
  cancelHref?: string;
  epics?: Array<{ id: string; title: string }>;
}

const STORY_POINTS_OPTIONS = [
  { value: '', label: 'Not estimated' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '5', label: '5' },
  { value: '8', label: '8' },
  { value: '13', label: '13' },
  { value: '21', label: '21' },
];

const STATUS_OPTIONS = [
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'PLANNED', label: 'Planned' },
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

export function StoryForm({
  formAction,
  initialData,
  loading = false,
  error = null,
  submitLabel = 'Create Story',
  cancelHref,
  epics = [],
  className = '',
  ...props
}: StoryFormProps) {
  // Initialize acceptance criteria from initialData or empty array
  const getInitialAcceptanceCriteria = (): string[] => {
    if (initialData?.acceptanceCriteria && initialData.acceptanceCriteria.length > 0) {
      return initialData.acceptanceCriteria;
    }
    return [''];
  };

  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>(getInitialAcceptanceCriteria);

  const addAcceptanceCriteria = () => {
    setAcceptanceCriteria([...acceptanceCriteria, '']);
  };

  const updateAcceptanceCriteria = (index: number, value: string) => {
    const updated = [...acceptanceCriteria];
    updated[index] = value;
    setAcceptanceCriteria(updated);
  };

  const removeAcceptanceCriteria = (index: number) => {
    if (acceptanceCriteria.length > 1) {
      setAcceptanceCriteria(acceptanceCriteria.filter((_, i) => i !== index));
    }
  };

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
            placeholder="e.g., User Login"
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
            rows={3}
            placeholder="Additional details about the story..."
            defaultValue={initialData?.description}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="as" variant="required">
              As a...
            </Label>
            <Input
              id="as"
              name="as"
              placeholder="e.g., user"
              required
              defaultValue={initialData?.as}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iWant" variant="required">
              I want...
            </Label>
            <Input
              id="iWant"
              name="iWant"
              placeholder="e.g., to login"
              required
              defaultValue={initialData?.iWant}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="soThat" variant="required">
              So that...
            </Label>
            <Input
              id="soThat"
              name="soThat"
              placeholder="e.g., I can access my account"
              required
              defaultValue={initialData?.soThat}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label variant="optional">
            Acceptance Criteria
          </Label>
          <div className="space-y-2">
            {acceptanceCriteria.map((criteria, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="text"
                  name={`acceptanceCriteria_${index}`}
                  value={criteria}
                  onChange={(e) => updateAcceptanceCriteria(index, e.target.value)}
                  placeholder="e.g., User can login with valid credentials"
                  disabled={loading}
                  className="flex-1"
                />
                {acceptanceCriteria.length > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => removeAcceptanceCriteria(index)}
                    disabled={loading}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={addAcceptanceCriteria}
              disabled={loading}
            >
              + Add Acceptance Criteria
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="storyPoints" variant="optional">
              Story Points
            </Label>
            <Select
              id="storyPoints"
              name="storyPoints"
              options={STORY_POINTS_OPTIONS}
              defaultValue={initialData?.storyPoints?.toString() || ''}
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
              defaultValue={initialData?.status || 'BACKLOG'}
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <div className="space-y-2">
            <Label htmlFor="epicId" variant="optional">
              Epic (Optional)
            </Label>
            <Select
              id="epicId"
              name="epicId"
              options={[
                { value: '', label: 'No epic' },
                ...epics.map(epic => ({ value: epic.id, label: epic.title }))
              ]}
              defaultValue={initialData?.epicId || ''}
              disabled={loading}
            />
          </div>
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
