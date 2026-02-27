import { EpicPrismaRepository } from '@/adapters/driven/persistence/prisma/epic-prisma-repository';
import { EpicId } from '@/core/domain/value-objects/identifier';
import { EpicDtoMapper } from '@/core/application/dtos/epic.dto';
import { Text, Breadcrumb, Badge } from '@fabio.caffarello/react-design-system';
import { statusToBadgeVariant, priorityToBadgeVariant } from '@/presentation/utils/badge-mappers';

export default async function EpicDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let epic: any = null;
  let error: string | null = null;

  try {
    const repository = new EpicPrismaRepository();
    const epicId = EpicId.create(params.id);
    const epicEntity = await repository.findById(epicId);
    
    if (epicEntity) {
      epic = EpicDtoMapper.toDto(epicEntity);
    } else {
      error = 'Epic not found';
    }
  } catch (err) {
    error = 'Failed to load epic';
    console.error('Error fetching epic:', err);
  }

  if (error || !epic) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <Text as="h1" className="text-2xl font-bold text-gray-900 mb-4">
            Epic Not Found
          </Text>
          <Text as="p" className="text-gray-600 mb-6">
            {error || 'The epic you are looking for does not exist.'}
          </Text>
          <a
            href="/epics"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Epics
          </a>
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
            { label: 'Epics', href: '/epics' },
            { label: epic.title },
          ]}
          className="mb-4"
        />
        <div className="flex justify-between items-start mt-4">
          <div>
            <Text as="h1" className="text-3xl font-bold text-gray-900">
              {epic.title}
            </Text>
            {epic.description && (
              <Text as="p" className="mt-2 text-sm text-gray-600">
                {epic.description}
              </Text>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant={statusToBadgeVariant(epic.status)}>
              {epic.status}
            </Badge>
            <Badge variant={priorityToBadgeVariant(epic.priority)}>
              {epic.priority}
            </Badge>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Stories</h2>
          <a
            href={`/stories/new?epicId=${epic.id}`}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Add Story
          </a>
        </div>
        {epic.stories && epic.stories.length > 0 ? (
          <div className="space-y-4">
            {epic.stories.map((story: any) => (
              <div
                key={story.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{story.title}</h3>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>
                        <strong>As a</strong> {story.as}
                      </p>
                      <p>
                        <strong>I want</strong> {story.iWant}
                      </p>
                      <p>
                        <strong>So that</strong> {story.soThat}
                      </p>
                    </div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {story.storyPoints && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {story.storyPoints} points
                        </span>
                      )}
                      <a
                        href={`/tasks/new?storyId=${story.id}`}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        + Add Task
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        story.status === 'DONE'
                          ? 'bg-green-100 text-green-800'
                          : story.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : story.status === 'REVIEW'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {story.status}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        story.priority === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : story.priority === 'HIGH'
                          ? 'bg-orange-100 text-orange-800'
                          : story.priority === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {story.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm mb-4">No stories yet. Add a story to get started.</p>
            <a
              href={`/stories/new?epicId=${epic.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create First Story
            </a>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <a
          href={`/epics/${epic.id}/edit`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Edit Epic
        </a>
        <a
          href={`/stories/new?epicId=${epic.id}`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Story
        </a>
      </div>
    </div>
  );
}
