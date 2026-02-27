'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createEpic } from '@/adapters/driving/actions/epic.actions';
import { EpicForm } from '@/presentation/components';
import { Text, Breadcrumb } from '@fabio.caffarello/react-design-system';

export default function NewEpicPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createEpicAction, null);

  useEffect(() => {
    if (state?.success) {
      router.push(`/epics/${state.data.id}`);
    }
  }, [state, router]);

  async function createEpicAction(
    prevState: any,
    formData: FormData
  ): Promise<any> {
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || undefined;
    const priority = (formData.get('priority') as string) || 'MEDIUM';

    return createEpic(title, description, priority);
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Epics', href: '/epics' },
            { label: 'Create New Epic' },
          ]}
          className="mb-4"
        />
        <Text as="h1" className="text-3xl font-bold text-gray-900">
          Create New Epic
        </Text>
        <Text as="p" className="mt-2 text-sm text-gray-600">
          Create a new epic to organize related user stories
        </Text>
      </div>

      <EpicForm
        formAction={formAction}
        loading={isPending}
        error={state?.success === false ? state.error : null}
        submitLabel="Create Epic"
        cancelHref="/epics"
      />
    </div>
  );
}
