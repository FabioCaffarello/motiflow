'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Table, Text, Button, Badge } from '@fabio.caffarello/react-design-system';
import type { TableColumn } from '@fabio.caffarello/react-design-system';
import Link from 'next/link';
import { listTasks, deleteTask } from '@/adapters/driving/actions/task.actions';
import { listStories } from '@/adapters/driving/actions/story.actions';
import type { TaskDto } from '@/core/application/dtos/task.dto';
import { statusToBadgeVariant, priorityToBadgeVariant } from '@/presentation/utils/badge-mappers';
import { useTablePagination } from '@/presentation/hooks/useTablePagination';
import { useTableFilters } from '@/presentation/hooks/useTableFilters';
import { useTableSorting } from '@/presentation/hooks/useTableSorting';
import { ConfirmDialog } from '@/presentation/components';

function TasksTableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [stories, setStories] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
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
      assignee: searchParams.get('filter_assignee') || '',
      storyId: searchParams.get('filter_storyId') || '',
    },
    syncWithUrl: true,
  });

  const { sortColumn, sortDirection, handleSort } = useTableSorting({
    defaultSortColumn: searchParams.get('sort') || '',
    defaultSortDirection: (searchParams.get('order') as 'asc' | 'desc') || 'asc',
    syncWithUrl: true,
  });

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [page, pageSize, filters, sortColumn, sortDirection]);

  const loadStories = async () => {
    try {
      const result = await listStories();
      if (result.success) {
        const storiesData = Array.isArray(result.data) 
          ? result.data 
          : result.data.stories;
        setStories(storiesData.map((story: any) => ({ id: story.id, title: story.title })));
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const result = await listTasks({
        filters: {
          status: filters.status || undefined,
          priority: filters.priority || undefined,
          assignee: filters.assignee || undefined,
          storyId: filters.storyId || undefined,
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
        setTasks(result.data.tasks);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTask) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteTask(selectedTask.id);
      if (result.success) {
        router.refresh();
        loadTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setSelectedTask(null);
    }
  };

  const getStoryTitle = (storyId: string | null) => {
    if (!storyId) return 'No story';
    const story = stories.find(s => s.id === storyId);
    return story?.title || 'Unknown';
  };

  const columns: TableColumn<TaskDto>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, row) => (
        <Link
          href={`/tasks/${row.id}`}
          className="font-medium text-indigo-600 hover:text-indigo-900"
        >
          {value}
        </Link>
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
      key: 'estimate',
      label: 'Estimate',
      sortable: true,
      render: (value) => (
        <Text as="span" className="text-sm text-gray-600">
          {value ? `${value}h` : '-'}
        </Text>
      ),
    },
    {
      key: 'assignee',
      label: 'Assignee',
      sortable: true,
      render: (value) => (
        <Text as="span" className="text-sm text-gray-600">
          {value || '-'}
        </Text>
      ),
    },
    {
      key: 'storyId',
      label: 'Story',
      hiddenOnMobile: true,
      render: (value) => (
        value ? (
          <Link
            href={`/stories/${value}`}
            className="text-sm text-indigo-600 hover:text-indigo-900"
          >
            {getStoryTitle(value)}
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
              Tasks
            </Text>
            <Text as="p" className="mt-2 text-sm text-gray-600">
              Manage your tasks and track their progress
            </Text>
          </div>
          <Link href="/tasks/new">
            <Button variant="regular" size="md">Create Task</Button>
          </Link>
        </div>

        <Table
          columns={columns}
          data={tasks}
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
                  { value: 'TODO', label: 'To Do' },
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
                key: 'assignee',
                label: 'Assignee',
                type: 'text',
                placeholder: 'Filter by assignee...',
              },
              {
                key: 'storyId',
                label: 'Story',
                type: 'select',
                options: [
                  { value: '', label: 'All Stories' },
                  ...stories.map(story => ({ value: story.id, label: story.title })),
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
              onClick: () => router.push(`/tasks/${row.id}`),
            },
            {
              label: 'Edit',
              onClick: () => router.push(`/tasks/${row.id}/edit`),
            },
            {
              label: 'Delete',
              onClick: () => {
                setSelectedTask(row);
                setShowDeleteDialog(true);
              },
              variant: 'danger',
            },
          ]}
          rowId={(row) => row.id}
          emptyStateTitle="No tasks yet"
          emptyStateMessage="Get started by creating your first task to track your work."
          emptyStateAction={
            <Link href="/tasks/new">
              <Button variant="regular">Create Task</Button>
            </Link>
          }
        />
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedTask(null);
        }}
        onConfirm={handleDelete}
        title="Delete Task"
        message={
          selectedTask
            ? `Are you sure you want to delete "${selectedTask.title}"? This action cannot be undone.`
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

export default function TasksPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksTableContent />
    </Suspense>
  );
}
