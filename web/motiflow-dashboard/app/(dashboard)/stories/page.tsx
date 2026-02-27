'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Table, Text, Button, Badge } from '@fabio.caffarello/react-design-system';
import type { TableColumn } from '@fabio.caffarello/react-design-system';
import Link from 'next/link';
import { listStories, deleteStory } from '@/adapters/driving/actions/story.actions';
import { listEpics } from '@/adapters/driving/actions/epic.actions';
import type { StoryDto } from '@/core/application/dtos/story.dto';
import { statusToBadgeVariant, priorityToBadgeVariant } from '@/presentation/utils/badge-mappers';
import { useTablePagination } from '@/presentation/hooks/useTablePagination';
import { useTableFilters } from '@/presentation/hooks/useTableFilters';
import { useTableSorting } from '@/presentation/hooks/useTableSorting';
import { ConfirmDialog } from '@/presentation/components';

function StoriesTableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stories, setStories] = useState<StoryDto[]>([]);
  const [epics, setEpics] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedStory, setSelectedStory] = useState<StoryDto | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { page, pageSize, setPage, setPageSize } = useTablePagination({
    defaultPage: 1,
    defaultPageSize: 10,
    syncWithUrl: true,
  });

  const { filters, setFilters } = useTableFilters({
    initialFilters: {
      status: searchParams.get('filter_status') || '',
      priority: searchParams.get('filter_priority') || '',
      epicId: searchParams.get('filter_epicId') || '',
    },
    syncWithUrl: true,
  });

  const { sortColumn, sortDirection, handleSort } = useTableSorting({
    defaultSortColumn: searchParams.get('sort') || '',
    defaultSortDirection: (searchParams.get('order') as 'asc' | 'desc') || 'asc',
    syncWithUrl: true,
  });

  useEffect(() => {
    loadEpics();
  }, []);

  useEffect(() => {
    loadStories();
  }, [page, pageSize, filters, sortColumn, sortDirection]);

  const loadEpics = async () => {
    try {
      const result = await listEpics();
      if (result.success && Array.isArray(result.data)) {
        // Handle old format (array) for backward compatibility
        setEpics(result.data.map((epic: any) => ({ id: epic.id, title: epic.title })));
      } else if (result.success && result.data.epics) {
        // Handle new format (paginated)
        setEpics(result.data.epics.map((epic: any) => ({ id: epic.id, title: epic.title })));
      }
    } catch (error) {
      console.error('Error loading epics:', error);
    }
  };

  const loadStories = async () => {
    setLoading(true);
    try {
      const result = await listStories({
        filters: {
          status: filters.status || undefined,
          priority: filters.priority || undefined,
          epicId: filters.epicId || undefined,
        },
        pagination: {
          page,
          pageSize,
        },
        sorting: sortColumn
          ? {
              sortBy: sortColumn,
              sortOrder: sortDirection,
            }
          : undefined,
      });

      if (result.success) {
        setStories(result.data.stories);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStory) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteStory(selectedStory.id);
      if (result.success) {
        router.refresh();
        loadStories();
      }
    } catch (error) {
      console.error('Error deleting story:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setSelectedStory(null);
    }
  };

  const getEpicTitle = (epicId: string | null) => {
    if (!epicId) return 'No epic';
    const epic = epics.find(e => e.id === epicId);
    return epic?.title || 'Unknown';
  };

  const columns: TableColumn<StoryDto>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, row) => (
        <Link
          href={`/stories/${row.id}`}
          className="font-medium text-indigo-600 hover:text-indigo-900"
        >
          {value}
        </Link>
      ),
    },
    {
      key: 'userStory',
      label: 'User Story',
      render: (value, row) => (
        <div className="text-sm text-gray-600">
          <Text as="span" className="font-medium">As a</Text> {row.as},{' '}
          <Text as="span" className="font-medium">I want</Text> {row.iWant},{' '}
          <Text as="span" className="font-medium">so that</Text> {row.soThat}
        </div>
      ),
    },
    {
      key: 'storyPoints',
      label: 'Points',
      sortable: true,
      render: (value) => (
        <Text as="span" className="text-sm text-gray-600">
          {value || '-'}
        </Text>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={statusToBadgeVariant(value)}>{value}</Badge>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => (
        <Badge variant={priorityToBadgeVariant(value)}>{value}</Badge>
      ),
    },
    {
      key: 'epicId',
      label: 'Epic',
      hiddenOnMobile: true,
      render: (value) => (
        value ? (
          <Link
            href={`/epics/${value}`}
            className="text-sm text-indigo-600 hover:text-indigo-900"
          >
            {getEpicTitle(value)}
          </Link>
        ) : (
          <Text as="span" className="text-sm text-gray-400">-</Text>
        )
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
      hiddenOnMobile: true,
      render: (value) => (
        <Text as="span" className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </Text>
      ),
    },
  ];

  return (
    <>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Text as="h1" className="text-3xl font-bold text-gray-900">
              User Stories
            </Text>
            <Text as="p" className="mt-2 text-sm text-gray-600">
              Manage your user stories and their acceptance criteria
            </Text>
          </div>
          <Link href="/stories/new">
            <Button variant="regular" size="md">Create Story</Button>
          </Link>
        </div>

        <Table
          columns={columns}
          data={stories}
          loading={loading}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          filters={{
            config: [
              {
                key: 'status',
                label: 'Status',
                type: 'select',
                options: [
                  { value: 'BACKLOG', label: 'Backlog' },
                  { value: 'PLANNED', label: 'Planned' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'REVIEW', label: 'Review' },
                  { value: 'DONE', label: 'Done' },
                ],
              },
              {
                key: 'priority',
                label: 'Priority',
                type: 'select',
                options: [
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'CRITICAL', label: 'Critical' },
                ],
              },
              {
                key: 'epicId',
                label: 'Epic',
                type: 'select',
                options: [
                  { value: '', label: 'All Epics' },
                  ...epics.map(epic => ({ value: epic.id, label: epic.title })),
                ],
              },
            ],
            onFilter: setFilters,
            initialValues: filters,
          }}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
            onPageSizeChange: setPageSize,
          }}
          actions={(row) => [
            {
              label: 'View',
              onClick: () => router.push(`/stories/${row.id}`),
            },
            {
              label: 'Edit',
              onClick: () => router.push(`/stories/${row.id}/edit`),
            },
            {
              label: 'Delete',
              onClick: () => {
                setSelectedStory(row);
                setShowDeleteDialog(true);
              },
              variant: 'danger',
            },
          ]}
          rowId={(row) => row.id}
          emptyStateTitle="No stories yet"
          emptyStateMessage="Get started by creating your first user story to break down your work."
          emptyStateAction={
            <Link href="/stories/new">
              <Button variant="regular">Create Story</Button>
            </Link>
          }
        />
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedStory(null);
        }}
        onConfirm={handleDelete}
        title="Delete Story"
        message={
          selectedStory
            ? `Are you sure you want to delete "${selectedStory.title}"? This action cannot be undone and will also delete all associated tasks.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </>
  );
}

export default function StoriesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StoriesTableContent />
    </Suspense>
  );
}
