'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createTask } from '@/adapters/driving/actions/task.actions';
import { listStories } from '@/adapters/driving/actions/story.actions';
import { TaskForm } from '@/presentation/components';
import { Text, Breadcrumb } from '@fabio.caffarello/react-design-system';

export default function NewTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams.get('storyId');
  
  const [state, formAction, isPending] = useActionState(createTaskAction, null);
  const [stories, setStories] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    // Load stories for dropdown using Server Action
    listStories().then(result => {
      if (result.success) {
        setStories(result.data);
      }
    });
  }, []);

  useEffect(() => {
    if (state?.success) {
      if (state.data.storyId) {
        router.push('/tasks');
      } else {
        router.push('/tasks');
      }
    }
  }, [state, router]);

  async function createTaskAction(
    prevState: any,
    formData: FormData
  ): Promise<any> {
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || undefined;
    const status = (formData.get('status') as string) || 'TODO';
    const priority = (formData.get('priority') as string) || 'MEDIUM';
    const estimate = formData.get('estimate') 
      ? parseInt(formData.get('estimate') as string) 
      : undefined;
    const assignee = (formData.get('assignee') as string) || undefined;
    const storyIdValue = (formData.get('storyId') as string) || storyId || undefined;

    if (!storyIdValue) {
      return { success: false, error: 'Story is required' };
    }

    return createTask(
      title,
      storyIdValue,
      description,
      priority,
      estimate,
      assignee
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Tasks', href: '/tasks' },
            { label: 'Create New Task' },
          ]}
          className="mb-4"
        />
        <Text as="h1" className="text-3xl font-bold text-gray-900">
          Create New Task
        </Text>
        <Text as="p" className="mt-2 text-sm text-gray-600">
          Create a new task to break down work for a user story
        </Text>
      </div>

      <TaskForm
        formAction={formAction}
        loading={isPending}
        error={state?.success === false ? state.error : null}
        submitLabel="Create Task"
        cancelHref="/tasks"
        stories={stories}
        initialData={storyId ? { storyId } : undefined}
      />
    </div>
  );
}
