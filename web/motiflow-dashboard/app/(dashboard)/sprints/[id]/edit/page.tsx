'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSprint, updateSprint } from '@/adapters/driving/actions/sprint.actions';
import { SprintForm } from '@/presentation/components';
import { Text, Breadcrumb } from '@fabio.caffarello/react-design-system';

export default function EditSprintPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [state, formAction, isPending] = useActionState(updateSprintAction, null);
  const [sprint, setSprint] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load sprint data
    getSprint(id).then(result => {
      if (result.success) {
        setSprint(result.data);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (state?.success) {
      router.push(`/sprints/${id}`);
    }
  }, [state, router, id]);

  async function updateSprintAction(
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

    return updateSprint(id, {
      name,
      goal,
      status,
      startDate,
      endDate,
    });
  }

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <Text as="p">Loading...</Text>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <Text as="h1" className="text-2xl font-bold text-gray-900 mb-4">
          Sprint Not Found
        </Text>
        <Text as="p" className="text-gray-600 mb-6">
          The sprint you are looking for does not exist.
        </Text>
        <a
          href="/sprints"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Sprints
        </a>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Sprints', href: '/sprints' },
            { label: sprint.name, href: `/sprints/${id}` },
            { label: 'Edit' },
          ]}
          className="mb-4"
        />
        <Text as="h1" className="text-3xl font-bold text-gray-900">
          Edit Sprint
        </Text>
        <Text as="p" className="mt-2 text-sm text-gray-600">
          Update sprint information
        </Text>
      </div>

      <SprintForm
        formAction={formAction}
        loading={isPending}
        error={state?.success === false ? state.error : null}
        submitLabel="Update Sprint"
        cancelHref={`/sprints/${id}`}
        initialData={{
          name: sprint.name,
          goal: sprint.goal || undefined,
          status: sprint.status,
          startDate: sprint.startDate || undefined,
          endDate: sprint.endDate || undefined,
        }}
      />
    </div>
  );
}
