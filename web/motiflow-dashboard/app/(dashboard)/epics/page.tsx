'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Table, Text, Button, Badge } from '@fabio.caffarello/react-design-system';
import type { TableColumn } from '@fabio.caffarello/react-design-system';
import Link from 'next/link';
import { listEpics, deleteEpic } from '@/adapters/driving/actions/epic.actions';
import type { EpicDto } from '@/core/application/dtos/epic.dto';
import { statusToBadgeVariant, priorityToBadgeVariant } from '@/presentation/utils/badge-mappers';
import { useTablePagination } from '@/presentation/hooks/useTablePagination';
import { useTableFilters } from '@/presentation/hooks/useTableFilters';
import { useTableSorting } from '@/presentation/hooks/useTableSorting';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/presentation/components';

function EpicsTableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [epics, setEpics] = useState<EpicDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedEpic, setSelectedEpic] = useState<EpicDto | null>(null);
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
  }, [page, pageSize, filters, sortColumn, sortDirection]);

  const loadEpics = async () => {
    setLoading(true);
    try {
      const result = await listEpics({
        filters: {
          status: filters.status || undefined,
          priority: filters.priority || undefined,
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
        setEpics(result.data.epics);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('Error loading epics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEpic) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteEpic(selectedEpic.id);
      if (result.success) {
        router.refresh();
        loadEpics();
      }
    } catch (error) {
      console.error('Error deleting epic:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setSelectedEpic(null);
    }
  };

  const columns: TableColumn<EpicDto>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, row) => (
        <Link
          href={`/epics/${row.id}`}
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
      key: 'stories',
      label: 'Stories',
      render: (value, row) => (
        <Text as="span" className="text-sm text-gray-600">
          {row.stories?.length || 0}
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
              Epics
            </Text>
            <Text as="p" className="mt-2 text-sm text-gray-600">
              Manage your epics and their associated stories
            </Text>
          </div>
          <Link href="/epics/new">
            <Button variant="regular" size="md">Create Epic</Button>
          </Link>
        </div>

        <Table
          columns={columns}
          data={epics}
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
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'ARCHIVED', label: 'Archived' },
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
              onClick: () => router.push(`/epics/${row.id}`),
            },
            {
              label: 'Edit',
              onClick: () => router.push(`/epics/${row.id}/edit`),
            },
            {
              label: 'Delete',
              onClick: () => {
                setSelectedEpic(row);
                setShowDeleteDialog(true);
              },
              variant: 'danger',
            },
          ]}
          rowId={(row) => row.id}
          emptyStateTitle="No epics yet"
          emptyStateMessage="Get started by creating your first epic to organize your work."
          emptyStateAction={
            <Link href="/epics/new">
              <Button variant="regular">Create Epic</Button>
            </Link>
          }
        />
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedEpic(null);
        }}
        onConfirm={handleDelete}
        title="Delete Epic"
        message={
          selectedEpic
            ? `Are you sure you want to delete "${selectedEpic.title}"? This action cannot be undone and will also delete all associated stories and tasks.`
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

export default function EpicsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EpicsTableContent />
    </Suspense>
  );
}
