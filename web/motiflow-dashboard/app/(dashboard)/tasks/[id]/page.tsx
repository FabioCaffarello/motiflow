import { TaskPrismaRepository } from '@/adapters/driven/persistence/prisma/task-prisma-repository';
import { TaskId } from '@/core/domain/value-objects/identifier';
import { Text, Breadcrumb, Badge } from '@fabio.caffarello/react-design-system';
import { statusToBadgeVariant, priorityToBadgeVariant } from '@/presentation/utils/badge-mappers';
import Link from 'next/link';
import { Button } from '@fabio.caffarello/react-design-system';

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let task: any = null;
  let error: string | null = null;

  try {
    const repository = new TaskPrismaRepository();
    const taskId = TaskId.create(params.id);
    const taskEntity = await repository.findById(taskId);
    
    if (taskEntity) {
      task = {
        id: taskEntity.id.getValue(),
        title: taskEntity.getTitle(),
        description: taskEntity.getDescription(),
        status: taskEntity.getStatus().getValue(),
        priority: taskEntity.getPriority().getValue(),
        estimate: taskEntity.getEstimate(),
        assignee: taskEntity.getAssignee(),
        storyId: taskEntity.getStoryId()?.getValue() || null,
        createdAt: taskEntity.createdAt.toISOString(),
        updatedAt: taskEntity.getUpdatedAt().toISOString(),
      };
    } else {
      error = 'Task not found';
    }
  } catch (err) {
    error = 'Failed to load task';
    console.error('Error fetching task:', err);
  }

  if (error || !task) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <Text as="h1" className="text-2xl font-bold text-gray-900 mb-4">
            Task Not Found
          </Text>
          <Text as="p" className="text-gray-600 mb-6">
            {error || 'The task you are looking for does not exist.'}
          </Text>
          <Link href="/tasks">
            <Button variant="regular">Back to Tasks</Button>
          </Link>
        </div>
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
            { label: task.title },
          ]}
          className="mb-4"
        />
        <div className="flex justify-between items-start">
          <div>
            <Text as="h1" className="text-3xl font-bold text-gray-900">
              {task.title}
            </Text>
            <div className="mt-2 flex gap-2">
              <Badge variant={statusToBadgeVariant(task.status)}>
                {task.status}
              </Badge>
              <Badge variant={priorityToBadgeVariant(task.priority)}>
                {task.priority}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/tasks/${task.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Link href="/tasks">
              <Button variant="secondary">Back to Tasks</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        {task.description && (
          <div>
            <Text as="h2" className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </Text>
            <Text as="p" className="text-gray-700">
              {task.description}
            </Text>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {task.estimate && (
            <div>
              <Text as="h3" className="text-sm font-medium text-gray-500 mb-1">
                Estimate
              </Text>
              <Text as="p" className="text-gray-900">
                {task.estimate} hours
              </Text>
            </div>
          )}

          {task.assignee && (
            <div>
              <Text as="h3" className="text-sm font-medium text-gray-500 mb-1">
                Assignee
              </Text>
              <Text as="p" className="text-gray-900">
                {task.assignee}
              </Text>
            </div>
          )}
        </div>

        {task.storyId && (
          <div>
            <Text as="h2" className="text-lg font-semibold text-gray-900 mb-2">
              Story
            </Text>
            <Link href={`/stories/${task.storyId}`}>
              <Text as="span" className="text-indigo-600 hover:text-indigo-800">
                View Story →
              </Text>
            </Link>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <Text as="p" className="text-sm text-gray-500">
            Created: {new Date(task.createdAt).toLocaleDateString()}
          </Text>
          <Text as="p" className="text-sm text-gray-500">
            Updated: {new Date(task.updatedAt).toLocaleDateString()}
          </Text>
        </div>
      </div>
    </div>
  );
}
