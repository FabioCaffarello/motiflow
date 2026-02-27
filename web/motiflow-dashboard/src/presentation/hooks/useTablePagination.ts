'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface UseTablePaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  syncWithUrl?: boolean;
}

export interface UseTablePaginationReturn {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  reset: () => void;
}

/**
 * Hook for managing table pagination state
 * Optionally syncs with URL search params for deep linking
 */
export function useTablePagination(
  options: UseTablePaginationOptions = {}
): UseTablePaginationReturn {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    syncWithUrl = true,
  } = options;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getPageFromUrl = useCallback(() => {
    if (!syncWithUrl || !searchParams) return defaultPage;
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : defaultPage;
  }, [searchParams, syncWithUrl, defaultPage]);

  const getPageSizeFromUrl = useCallback(() => {
    if (!syncWithUrl || !searchParams) return defaultPageSize;
    const pageSizeParam = searchParams.get('pageSize');
    return pageSizeParam ? parseInt(pageSizeParam, 10) : defaultPageSize;
  }, [searchParams, syncWithUrl, defaultPageSize]);

  const [page, setPageState] = useState(() => getPageFromUrl());
  const [pageSize, setPageSizeState] = useState(() => getPageSizeFromUrl());

  // Sync state with URL when searchParams change (but not when we're the ones updating)
  useEffect(() => {
    if (syncWithUrl && searchParams) {
      const urlPage = getPageFromUrl();
      const urlPageSize = getPageSizeFromUrl();
      if (urlPage !== page) {
        setPageState(urlPage);
      }
      if (urlPageSize !== pageSize) {
        setPageSizeState(urlPageSize);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()]);

  const updateUrl = useCallback(
    (updates: { page?: number; pageSize?: number }) => {
      if (!syncWithUrl || !searchParams || !pathname) return;

      const params = new URLSearchParams(searchParams.toString());
      
      if (updates.page !== undefined) {
        if (updates.page === defaultPage) {
          params.delete('page');
        } else {
          params.set('page', updates.page.toString());
        }
      }

      if (updates.pageSize !== undefined) {
        if (updates.pageSize === defaultPageSize) {
          params.delete('pageSize');
        } else {
          params.set('pageSize', updates.pageSize.toString());
        }
      }

      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.push(newUrl);
    },
    [syncWithUrl, searchParams, router, pathname, defaultPage, defaultPageSize]
  );

  const setPage = useCallback(
    (newPage: number) => {
      setPageState(newPage);
      updateUrl({ page: newPage });
    },
    [updateUrl]
  );

  const setPageSize = useCallback(
    (newPageSize: number) => {
      setPageSizeState(newPageSize);
      setPageState(1); // Reset to first page when changing page size
      updateUrl({ pageSize: newPageSize, page: 1 });
    },
    [updateUrl]
  );

  const reset = useCallback(() => {
    setPageState(defaultPage);
    setPageSizeState(defaultPageSize);
    if (syncWithUrl && pathname) {
      router.push(pathname);
    }
  }, [defaultPage, defaultPageSize, syncWithUrl, router, pathname]);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    reset,
  };
}
