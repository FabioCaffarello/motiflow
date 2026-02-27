import { ListEpicsUseCase } from '@/core/application/use-cases/epic/list-epics.use-case';
import { EpicPrismaRepository } from '@/adapters/driven/persistence/prisma/epic-prisma-repository';
import { Text, Card } from '@fabio.caffarello/react-design-system';
import Link from 'next/link';

export default async function DashboardPage() {
  // Get epics count directly from use case
  let epicsCount = 0;
  try {
    const repository = new EpicPrismaRepository();
    const useCase = new ListEpicsUseCase(repository);
    const result = await useCase.execute();
    epicsCount = result.total;
  } catch (error) {
    console.error('Error fetching epics:', error);
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <Text as="h1" className="text-3xl font-bold text-gray-900">Dashboard</Text>
        <Text as="p" className="mt-2 text-sm text-gray-600">
          Overview of your Motiflow workspace
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Epics</dt>
                  <dd className="text-lg font-medium text-gray-900">{epicsCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Sprints</dt>
                  <dd className="text-lg font-medium text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Tasks</dt>
                  <dd className="text-lg font-medium text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">ADRs</dt>
                  <dd className="text-lg font-medium text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Text as="h2" className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</Text>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/epics/new">
            <Card variant="hover" padding="large" className="cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <Text as="p" className="text-sm font-medium text-gray-900">Create Epic</Text>
                  <Text as="p" className="text-sm text-gray-500 truncate">Add a new epic</Text>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/stories/new">
            <Card variant="hover" padding="large" className="cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <Text as="p" className="text-sm font-medium text-gray-900">Create Story</Text>
                  <Text as="p" className="text-sm text-gray-500 truncate">Add a new user story</Text>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/sprints/new">
            <Card variant="hover" padding="large" className="cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <Text as="p" className="text-sm font-medium text-gray-900">Create Sprint</Text>
                  <Text as="p" className="text-sm text-gray-500 truncate">Plan a new sprint</Text>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
