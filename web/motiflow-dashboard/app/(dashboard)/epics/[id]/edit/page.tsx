'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getEpic, updateEpic } from '@/adapters/driving/actions/epic.actions';
import { EpicForm } from '@/presentation/components';
import { Text, Breadcrumb } from '@fabio.caffarello/react-design-system';

export default function EditEpicPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [state, formAction, isPending] = useActionState(updateEpicAction, null);
  const [epic, setEpic] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load epic data
    getEpic(id).then(result => {
      if (result.success) {
        setEpic(result.data);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (state?.success) {
      router.push(`/epics/${id}`);
    }
  }, [state, router, id]);

  async function updateEpicAction(
    prevState: any,
    formData: FormData
  ): Promise<any> {
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || undefined;
    const status = (formData.get('status') as string) || undefined;
    const priority = (formData.get('priority') as string) || 'MEDIUM';

    return updateEpic(id, {
      title,
      description,
      status,
      priority,
    });
  }

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <Text as="p">Loading...</Text>
      </div>
    );
  }

  if (!epic) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <Text as="h1" className="text-2xl font-bold text-gray-900 mb-4">
          Epic Not Found
        </Text>
        <Text as="p" className="text-gray-600 mb-6">
          The epic you are looking for does not exist.
        </Text>
        <a
          href="/epics"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Epics
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
            { label: 'Epics', href: '/epics' },
            { label: epic.title, href: `/epics/${id}` },
            { label: 'Edit' },
          ]}
          className="mb-4"
        />
        <Text as="h1" className="text-3xl font-bold text-gray-900">
          Edit Epic
        </Text>
        <Text as="p" className="mt-2 text-sm text-gray-600">
          Update epic information
        </Text>
      </div>

      <EpicForm
        formAction={formAction}
        loading={isPending}
        error={state?.success === false ? state.error : null}
        submitLabel="Update Epic"
        cancelHref={`/epics/${id}`}
        initialData={{
          title: epic.title,
          description: epic.description,
          status: epic.status,
          priority: epic.priority,
        }}
      />
    </div>
  );
}
