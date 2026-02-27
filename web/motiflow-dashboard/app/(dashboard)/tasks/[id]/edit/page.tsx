'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getTask, updateTask } from '@/adapters/driving/actions/task.actions';
import { listStories } from '@/adapters/driving/actions/story.actions';
import { TaskForm } from '@/presentation/components';
import { Text, Breadcrumb } from '@fabio.caffarello/react-design-system';

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [state, formAction, isPending] = useActionState(updateTaskAction, null);
  const [task, setTask] = useState<any>(null);
  const [stories, setStories] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load task and stories data
    Promise.all([
      getTask(id),
      listStories()
    ]).then(([taskResult, storiesResult]) => {
      if (taskResult.success) {
        setTask(taskResult.data);
      }
      if (storiesResult.success) {
        setStories(storiesResult.data);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (state?.success) {
      router.push(`/tasks/${id}`);
    }
  }, [state, router, id]);

  async function updateTaskAction(
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
    const storyId = (formData.get('storyId') as string) || undefined;

    return updateTask(id, {
      title,
      description,
      status,
      priority,
      estimate,
      assignee,
      storyId,
    });
  }

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <Text as="p">Loading...</Text>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <Text as="h1" className="text-2xl font-bold text-gray-900 mb-4">
          Task Not Found
        </Text>
        <Text as="p" className="text-gray-600 mb-6">
          The task you are looking for does not exist.
        </Text>
        <a
          href="/tasks"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Tasks
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
            { label: 'Tasks', href: '/tasks' },
            { label: task.title, href: `/tasks/${id}` },
            { label: 'Edit' },
          ]}
          className="mb-4"
        />
        <Text as="h1" className="text-3xl font-bold text-gray-900">
          Edit Task
        </Text>
        <Text as="p" className="mt-2 text-sm text-gray-600">
          Update task information
        </Text>
      </div>

      <TaskForm
        formAction={formAction}
        loading={isPending}
        error={state?.success === false ? state.error : null}
        submitLabel="Update Task"
        cancelHref={`/tasks/${id}`}
        stories={stories}
        initialData={{
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          estimate: task.estimate,
          assignee: task.assignee,
          storyId: task.storyId,
        }}
      />
    </div>
  );
}
