'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Table, Text, Button, Badge } from '@fabio.caffarello/react-design-system';
import type { TableColumn } from '@fabio.caffarello/react-design-system';
import Link from 'next/link';
import { listSprints, deleteSprint } from '@/adapters/driving/actions/sprint.actions';
import type { SprintDto } from '@/core/application/dtos/sprint.dto';
import { statusToBadgeVariant } from '@/presentation/utils/badge-mappers';
import { useTablePagination } from '@/presentation/hooks/useTablePagination';
import { useTableFilters } from '@/presentation/hooks/useTableFilters';
import { useTableSorting } from '@/presentation/hooks/useTableSorting';
import { ConfirmDialog } from '@/presentation/components';

function SprintsTableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sprints, setSprints] = useState<SprintDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedSprint, setSelectedSprint] = useState<SprintDto | null>(null);
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
    },
    syncWithUrl: true,
  });

  const { sortColumn, sortDirection, handleSort } = useTableSorting({
    defaultSortColumn: searchParams.get('sort') || '',
    defaultSortDirection: (searchParams.get('order') as 'asc' | 'desc') || 'asc',
    syncWithUrl: true,
  });

  useEffect(() => {
    loadSprints();
  }, [page, pageSize, filters, sortColumn, sortDirection]);

  const loadSprints = async () => {
    setLoading(true);
    try {
      const result = await listSprints({
        filters: {
          status: filters.status || undefined,
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
        setSprints(result.data.sprints);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('Error loading sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSprint) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteSprint(selectedSprint.id);
      if (result.success) {
        router.refresh();
        loadSprints();
      }
    } catch (error) {
      console.error('Error deleting sprint:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setSelectedSprint(null);
    }
  };

  const calculateDuration = (startDate: string | null, endDate: string | null): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both days
  };

  const getTotalStoryPoints = (stories: any[]): number => {
    return stories.reduce((sum, story) => sum + (story.storyPoints || 0), 0);
  };

  const columns: TableColumn<SprintDto>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, row) => (
        <Link
          href={`/sprints/${row.id}`}
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
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      hiddenOnMobile: true,
      render: (value) => (
        <Text as="span" className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString() : '-'}
        </Text>
      ),
    },
    {
      key: 'endDate',
      label: 'End Date',
      sortable: true,
      hiddenOnMobile: true,
      render: (value) => (
        <Text as="span" className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString() : '-'}
        </Text>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (value, row) => {
        const duration = calculateDuration(row.startDate, row.endDate);
        return (
          <Text as="span" className="text-sm text-gray-600">
            {duration > 0 ? `${duration} days` : '-'}
          </Text>
        );
      },
    },
    {
      key: 'stories',
      label: 'Stories',
      render: (value, row) => (
        <Text as="span" className="text-sm text-gray-600">
          {row.stories?.length || 0}
        </Text>
      ),
    },
    {
      key: 'storyPoints',
      label: 'Story Points',
      render: (value, row) => (
        <Text as="span" className="text-sm text-gray-600">
          {getTotalStoryPoints(row.stories || [])}
        </Text>
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
              Sprints
            </Text>
            <Text as="p" className="mt-2 text-sm text-gray-600">
              Manage your sprints and track progress
            </Text>
          </div>
          <Link href="/sprints/new">
            <Button variant="regular" size="md">Create Sprint</Button>
          </Link>
        </div>

        <Table
          columns={columns}
          data={sprints}
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
                  { value: 'PLANNED', label: 'Planned' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'CANCELLED', label: 'Cancelled' },
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
              onClick: () => router.push(`/sprints/${row.id}`),
            },
            {
              label: 'Edit',
              onClick: () => router.push(`/sprints/${row.id}/edit`),
            },
            {
              label: 'Delete',
              onClick: () => {
                setSelectedSprint(row);
                setShowDeleteDialog(true);
              },
              variant: 'danger',
            },
          ]}
          rowId={(row) => row.id}
          emptyStateTitle="No sprints yet"
          emptyStateMessage="Get started by creating your first sprint to organize your work."
          emptyStateAction={
            <Link href="/sprints/new">
              <Button variant="regular">Create Sprint</Button>
            </Link>
          }
        />
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedSprint(null);
        }}
        onConfirm={handleDelete}
        title="Delete Sprint"
        message={
          selectedSprint
            ? `Are you sure you want to delete "${selectedSprint.name}"? This action cannot be undone.`
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

export default function SprintsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SprintsTableContent />
    </Suspense>
  );
}
