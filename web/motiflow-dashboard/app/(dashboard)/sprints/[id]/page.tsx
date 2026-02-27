import { SprintPrismaRepository } from '@/adapters/driven/persistence/prisma/sprint-prisma-repository';
import { SprintId } from '@/core/domain/value-objects/identifier';
import { SprintDtoMapper } from '@/core/application/dtos/sprint.dto';
import { Text, Breadcrumb, Badge, Card } from '@fabio.caffarello/react-design-system';
import Link from 'next/link';
import { Button } from '@fabio.caffarello/react-design-system';
import { StoryCard, SprintActions } from '@/presentation/components';
import { statusToBadgeVariant } from '@/presentation/utils/badge-mappers';

export default async function SprintDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let sprint: any = null;
  let error: string | null = null;

  try {
    const repository = new SprintPrismaRepository();
    const sprintId = SprintId.create(params.id);
    const sprintEntity = await repository.findById(sprintId);
    
    if (sprintEntity) {
      sprint = SprintDtoMapper.toDto(sprintEntity);
    } else {
      error = 'Sprint not found';
    }
  } catch (err) {
    error = 'Failed to load sprint';
    console.error('Error fetching sprint:', err);
  }

  if (error || !sprint) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <Text as="h1" className="text-2xl font-bold text-gray-900 mb-4">
            Sprint Not Found
          </Text>
          <Text as="p" className="text-gray-600 mb-6">
            {error || 'The sprint you are looking for does not exist.'}
          </Text>
          <Link href="/sprints">
            <Button variant="regular">Back to Sprints</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Sprints', href: '/sprints' },
            { label: sprint.name },
          ]}
          className="mb-4"
        />
        <div className="flex justify-between items-start">
          <div>
            <Text as="h1" className="text-3xl font-bold text-gray-900">
              {sprint.name}
            </Text>
            {sprint.goal && (
              <Text as="p" className="mt-2 text-sm text-gray-600">
                {sprint.goal}
              </Text>
            )}
            <div className="mt-2 flex gap-2">
              <Badge variant={statusToBadgeVariant(sprint.status)}>
                {sprint.status}
              </Badge>
              {sprint.startDate && sprint.endDate && (
                <Badge variant="default">
                  {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <SprintActions sprintId={sprint.id} status={sprint.status} />
            <Link href={`/sprints/${sprint.id}/edit`}>
              <Button variant="secondary" size="md">Edit</Button>
            </Link>
            <Link href="/sprints">
              <Button variant="secondary" size="md">Back to Sprints</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Sprint Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <Card variant="default" padding="medium">
          <Text as="h3" className="text-sm font-medium text-gray-500 mb-1">
            Total Stories
          </Text>
          <Text as="p" className="text-2xl font-bold text-gray-900">
            {sprint.stories?.length || 0}
          </Text>
        </Card>
        <Card variant="default" padding="medium">
          <Text as="h3" className="text-sm font-medium text-gray-500 mb-1">
            Total Story Points
          </Text>
          <Text as="p" className="text-2xl font-bold text-gray-900">
            {sprint.stories?.reduce((sum: number, story: any) => sum + (story.storyPoints || 0), 0) || 0}
          </Text>
        </Card>
        <Card variant="default" padding="medium">
          <Text as="h3" className="text-sm font-medium text-gray-500 mb-1">
            Completion Rate
          </Text>
          <Text as="p" className="text-2xl font-bold text-gray-900">
            {sprint.stories && sprint.stories.length > 0
              ? Math.round(
                  (sprint.stories.filter((s: any) => s.status === 'DONE').length /
                    sprint.stories.length) *
                    100
                )
              : 0}
            %
          </Text>
        </Card>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <Text as="h2" className="text-xl font-semibold text-gray-900">
            Stories ({sprint.stories?.length || 0})
          </Text>
          <Link href={`/stories/new?sprintId=${sprint.id}`}>
            <Button variant="secondary" size="sm">
              + Add Story
            </Button>
          </Link>
        </div>
        {sprint.stories && sprint.stories.length > 0 ? (
          <div className="space-y-4">
            {sprint.stories.map((story: any) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Text as="p" className="text-gray-500 text-sm mb-4">
              No stories in this sprint yet.
            </Text>
            <Link href={`/stories/new?sprintId=${sprint.id}`}>
              <Button variant="secondary" size="sm">
                Add First Story
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
