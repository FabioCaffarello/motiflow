/**
 * SprintForm Component
 * 
 * Form component for creating and editing Sprints.
 * Uses design system components for consistent UI.
 */

'use client';

import { Input, Textarea, Select, Label, Button } from '@fabio.caffarello/react-design-system';
import { FormHTMLAttributes, useState, useEffect } from 'react';

export interface SprintFormData {
  name: string;
  goal?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
}

export interface SprintFormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  formAction: (formData: FormData) => void | Promise<void>;
  initialData?: Partial<SprintFormData>;
  loading?: boolean;
  error?: string | null;
  submitLabel?: string;
  cancelHref?: string;
}

const STATUS_OPTIONS = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const DURATION_OPTIONS = [
  { value: '', label: 'Custom' },
  { value: '7', label: '1 week' },
  { value: '14', label: '2 weeks' },
  { value: '21', label: '3 weeks' },
  { value: '28', label: '4 weeks' },
];

export function SprintForm({
  formAction,
  initialData,
  loading = false,
  error = null,
  submitLabel = 'Create Sprint',
  cancelHref,
  className = '',
  ...props
}: SprintFormProps) {
  const [startDate, setStartDate] = useState<string>(
    initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState<string>(
    initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : ''
  );
  const [durationDays, setDurationDays] = useState<string>(
    initialData?.durationDays?.toString() || ''
  );
  const [dateError, setDateError] = useState<string | null>(null);

  // Calculate duration when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end < start) {
        setDateError('End date cannot be before start date');
        return;
      }
      
      setDateError(null);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      setDurationDays(diffDays.toString());
    }
  }, [startDate, endDate]);

  // Set end date when duration is selected
  const handleDurationChange = (value: string) => {
    setDurationDays(value);
    if (value && startDate) {
      const start = new Date(startDate);
      const days = parseInt(value);
      const end = new Date(start);
      end.setDate(start.getDate() + days - 1); // -1 because we include start day
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    // Update end date min to be start date
    const endDateInput = document.getElementById('endDate') as HTMLInputElement;
    if (endDateInput) {
      endDateInput.min = newStartDate;
    }
    
    // If end date is before new start date, clear it
    if (endDate && newStartDate && endDate < newStartDate) {
      setEndDate('');
      setDateError('End date cannot be before start date');
    } else {
      setDateError(null);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    
    if (startDate && newEndDate && newEndDate < startDate) {
      setDateError('End date cannot be before start date');
    } else {
      setDateError(null);
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

      {dateError && (
        <div
          role="alert"
          className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded"
        >
          {dateError}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" variant="required">
            Sprint Name
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., Sprint 1 - Q1 2024"
            required
            defaultValue={initialData?.name}
            disabled={loading}
            variant="outlined"
            size="md"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal" variant="optional">
            Goal
          </Label>
          <Textarea
            id="goal"
            name="goal"
            rows={3}
            placeholder="What is the goal of this sprint?"
            defaultValue={initialData?.goal}
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
              defaultValue={initialData?.status || 'PLANNED'}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="durationDays" variant="optional">
              Duration (days)
            </Label>
            <Select
              id="durationDays"
              name="durationDays"
              options={DURATION_OPTIONS}
              value={durationDays}
              onChange={(e) => handleDurationChange(e.target.value)}
              disabled={loading}
            />
            {durationDays && !DURATION_OPTIONS.find(opt => opt.value === durationDays) && (
              <p className="text-xs text-gray-500 mt-1">
                Custom duration: {durationDays} days
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate" variant="optional">
              Start Date
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              disabled={loading}
              variant="outlined"
              size="md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" variant="optional">
              End Date
            </Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate || undefined}
              disabled={loading}
              variant="outlined"
              size="md"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
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
            disabled={loading || !!dateError}
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
