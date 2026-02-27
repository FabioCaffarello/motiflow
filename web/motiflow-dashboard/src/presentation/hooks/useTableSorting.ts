'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface UseTableSortingOptions {
  defaultSortColumn?: string;
  defaultSortDirection?: 'asc' | 'desc';
  syncWithUrl?: boolean;
}

export interface UseTableSortingReturn {
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (columnKey: string, direction: 'asc' | 'desc') => void;
  reset: () => void;
}

/**
 * Hook for managing table sorting state
 * Optionally syncs with URL search params for deep linking
 */
export function useTableSorting(
  options: UseTableSortingOptions = {}
): UseTableSortingReturn {
  const {
    defaultSortColumn = '',
    defaultSortDirection = 'asc',
    syncWithUrl = true,
  } = options;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getSortFromUrl = useCallback(() => {
    if (!syncWithUrl || !searchParams) {
      return {
        column: defaultSortColumn,
        direction: defaultSortDirection,
      };
    }
    
    const sortColumn = searchParams.get('sort') || defaultSortColumn;
    const sortDirection = (searchParams.get('order') as 'asc' | 'desc') || defaultSortDirection;
    
    return { column: sortColumn, direction: sortDirection };
  }, [searchParams, syncWithUrl, defaultSortColumn, defaultSortDirection]);

  const { column: initialColumn, direction: initialDirection } = getSortFromUrl();
  const [sortColumn, setSortColumnState] = useState(() => initialColumn);
  const [sortDirection, setSortDirectionState] = useState<'asc' | 'desc'>(() => initialDirection);

  // Sync state with URL when searchParams change (but not when we're the ones updating)
  useEffect(() => {
    if (syncWithUrl && searchParams) {
      const { column, direction } = getSortFromUrl();
      setSortColumnState(column);
      setSortDirectionState(direction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()]);

  const updateUrl = useCallback(
    (column: string, direction: 'asc' | 'desc') => {
      if (!syncWithUrl) return;

      const params = new URLSearchParams(searchParams.toString());
      
      if (column) {
        params.set('sort', column);
        params.set('order', direction);
      } else {
        params.delete('sort');
        params.delete('order');
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [syncWithUrl, searchParams, router, pathname]
  );

  const handleSort = useCallback(
    (columnKey: string, direction: 'asc' | 'desc') => {
      setSortColumnState(columnKey);
      setSortDirectionState(direction);
      updateUrl(columnKey, direction);
    },
    [updateUrl]
  );

  const reset = useCallback(() => {
    setSortColumnState(defaultSortColumn);
    setSortDirectionState(defaultSortDirection);
    if (syncWithUrl && searchParams && pathname) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('sort');
      params.delete('order');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.push(newUrl);
    }
  }, [defaultSortColumn, defaultSortDirection, syncWithUrl, searchParams, router, pathname]);

  return {
    sortColumn,
    sortDirection,
    handleSort,
    reset,
  };
}
