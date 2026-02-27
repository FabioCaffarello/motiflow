'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSprint } from '@/adapters/driving/actions/sprint.actions';
import { SprintForm } from '@/presentation/components';
import { Text, Breadcrumb } from '@fabio.caffarello/react-design-system';

export default function NewSprintPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createSprintAction, null);

  useEffect(() => {
    if (state?.success) {
      router.push(`/sprints/${state.data.id}`);
    }
  }, [state, router]);

  async function createSprintAction(
    prevState: any,
    formData: FormData
  ): Promise<any> {
    const name = formData.get('name') as string;
    const goal = (formData.get('goal') as string) || undefined;
    const status = (formData.get('status') as string) || 'PLANNED';
    const startDate = formData.get('startDate') 
      ? new Date(formData.get('startDate') as string)
      : undefined;
    const endDate = formData.get('endDate')
      ? new Date(formData.get('endDate') as string)
      : undefined;
    const durationDays = formData.get('durationDays')
      ? parseInt(formData.get('durationDays') as string)
      : undefined;

    return createSprint(name, goal, startDate, endDate, durationDays);
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Sprints', href: '/sprints' },
            { label: 'Create New Sprint' },
          ]}
          className="mb-4"
        />
        <Text as="h1" className="text-3xl font-bold text-gray-900">
          Create New Sprint
        </Text>
        <Text as="p" className="mt-2 text-sm text-gray-600">
          Create a new sprint to organize and track your work
        </Text>
      </div>

      <SprintForm
        formAction={formAction}
        loading={isPending}
        error={state?.success === false ? state.error : null}
        submitLabel="Create Sprint"
        cancelHref="/sprints"
      />
    </div>
  );
}
