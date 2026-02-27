import { StoryPrismaRepository } from '@/adapters/driven/persistence/prisma/story-prisma-repository';
import { TaskPrismaRepository } from '@/adapters/driven/persistence/prisma/task-prisma-repository';
import { StoryId } from '@/core/domain/value-objects/identifier';
import { StoryDtoMapper } from '@/core/application/dtos/story.dto';
import { Text, Breadcrumb, Badge, Card } from '@fabio.caffarello/react-design-system';
import { statusToBadgeVariant, priorityToBadgeVariant } from '@/presentation/utils/badge-mappers';
import Link from 'next/link';
import { Button } from '@fabio.caffarello/react-design-system';

export default async function StoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let story: any = null;
  let error: string | null = null;

  let tasks: any[] = [];

  try {
    const repository = new StoryPrismaRepository();
    const taskRepository = new TaskPrismaRepository();
    const storyId = StoryId.create(params.id);
    const storyEntity = await repository.findById(storyId);
    
    if (storyEntity) {
      story = {
        id: storyEntity.id.getValue(),
        title: storyEntity.getTitle(),
        description: storyEntity.getDescription(),
        as: storyEntity.getAs(),
        iWant: storyEntity.getIWant(),
        soThat: storyEntity.getSoThat(),
        storyPoints: storyEntity.getStoryPoints()?.getValue() || null,
        status: storyEntity.getStatus().getValue(),
        priority: storyEntity.getPriority().getValue(),
        epicId: storyEntity.getEpicId()?.getValue() || null,
        acceptanceCriteria: storyEntity.getAcceptanceCriteria().map(ac => ({
          description: ac.getDescription(),
          testable: ac.isTestable(),
          satisfied: ac.isSatisfied(),
        })),
        createdAt: storyEntity.createdAt.toISOString(),
        updatedAt: storyEntity.getUpdatedAt().toISOString(),
      };

      // Load related tasks
      const taskEntities = await taskRepository.findByStoryId(storyId);
      tasks = taskEntities.map(task => ({
        id: task.id.getValue(),
        title: task.getTitle(),
        description: task.getDescription(),
        status: task.getStatus().getValue(),
        priority: task.getPriority().getValue(),
        estimate: task.getEstimate(),
        assignee: task.getAssignee(),
      }));
    } else {
      error = 'Story not found';
    }
  } catch (err) {
    error = 'Failed to load story';
    console.error('Error fetching story:', err);
  }

  if (error || !story) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <Text as="h1" className="text-2xl font-bold text-gray-900 mb-4">
            Story Not Found
          </Text>
          <Text as="p" className="text-gray-600 mb-6">
            {error || 'The story you are looking for does not exist.'}
          </Text>
          <Link href="/stories">
            <Button variant="regular">Back to Stories</Button>
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
            { label: 'Stories', href: '/stories' },
            { label: story.title },
          ]}
          className="mb-4"
        />
        <div className="flex justify-between items-start">
          <div>
            <Text as="h1" className="text-3xl font-bold text-gray-900">
              {story.title}
            </Text>
            <div className="mt-2 flex gap-2">
              <Badge variant={statusToBadgeVariant(story.status)}>
                {story.status}
              </Badge>
              <Badge variant={priorityToBadgeVariant(story.priority)}>
                {story.priority}
              </Badge>
              {story.storyPoints && (
                <Badge variant="info">
                  {story.storyPoints} points
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/stories/${story.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Link href="/stories">
              <Button variant="secondary">Back to Stories</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        {story.description && (
          <div>
            <Text as="h2" className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </Text>
            <Text as="p" className="text-gray-700">
              {story.description}
            </Text>
          </div>
        )}

        <div>
          <Text as="h2" className="text-lg font-semibold text-gray-900 mb-2">
            User Story
          </Text>
          <div className="bg-gray-50 p-4 rounded-lg">
            <Text as="p" className="text-gray-700 mb-2">
              <Text as="span" className="font-medium">As a</Text> {story.as}
            </Text>
            <Text as="p" className="text-gray-700 mb-2">
              <Text as="span" className="font-medium">I want</Text> {story.iWant}
            </Text>
            <Text as="p" className="text-gray-700">
              <Text as="span" className="font-medium">So that</Text> {story.soThat}
            </Text>
          </div>
        </div>

        {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
          <div>
            <Text as="h2" className="text-lg font-semibold text-gray-900 mb-2">
              Acceptance Criteria
            </Text>
            <ul className="list-disc list-inside space-y-2">
              {story.acceptanceCriteria.map((criteria: any, index: number) => (
                <li key={index} className="text-gray-700">
                  {criteria.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {story.epicId && (
          <div>
            <Text as="h2" className="text-lg font-semibold text-gray-900 mb-2">
              Epic
            </Text>
            <Link href={`/epics/${story.epicId}`}>
              <Text as="span" className="text-indigo-600 hover:text-indigo-800">
                View Epic →
              </Text>
            </Link>
          </div>
        )}

        {tasks.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <Text as="h2" className="text-lg font-semibold text-gray-900">
                Related Tasks ({tasks.length})
              </Text>
              <Link href={`/tasks/new?storyId=${story.id}`}>
                <Button variant="secondary" size="sm">
                  + Add Task
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {tasks.map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Link href={`/tasks/${task.id}`}>
                        <Text as="h3" className="font-medium text-gray-900 hover:text-indigo-600">
                          {task.title}
                        </Text>
                      </Link>
                      {task.description && (
                        <Text as="p" className="text-sm text-gray-600 mt-1">
                          {task.description}
                        </Text>
                      )}
                      <div className="mt-2 flex gap-2 flex-wrap">
                        <Badge variant={statusToBadgeVariant(task.status)}>
                          {task.status}
                        </Badge>
                        <Badge variant={priorityToBadgeVariant(task.priority)}>
                          {task.priority}
                        </Badge>
                        {task.estimate && (
                          <Text as="span" className="text-sm text-gray-500">
                            {task.estimate}h
                          </Text>
                        )}
                        {task.assignee && (
                          <Text as="span" className="text-sm text-gray-500">
                            👤 {task.assignee}
                          </Text>
                        )}
                      </div>
                    </div>
                    <Link href={`/tasks/${task.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <Text as="h2" className="text-lg font-semibold text-gray-900">
                Related Tasks
              </Text>
              <Link href={`/tasks/new?storyId=${story.id}`}>
                <Button variant="secondary" size="sm">
                  + Add Task
                </Button>
              </Link>
            </div>
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Text as="p" className="text-gray-500">
                No tasks yet. Create one to get started.
              </Text>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <Text as="p" className="text-sm text-gray-500">
            Created: {new Date(story.createdAt).toLocaleDateString()}
          </Text>
          <Text as="p" className="text-sm text-gray-500">
            Updated: {new Date(story.updatedAt).toLocaleDateString()}
          </Text>
        </div>
      </div>
    </div>
  );
}
