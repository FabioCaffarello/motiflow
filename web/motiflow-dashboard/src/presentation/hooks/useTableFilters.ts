'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface UseTableFiltersOptions {
  initialFilters?: Record<string, any>;
  syncWithUrl?: boolean;
  debounceMs?: number;
}

export interface UseTableFiltersReturn {
  filters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  setFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Hook for managing table filters state
 * Optionally syncs with URL search params and debounces filter changes
 */
export function useTableFilters(
  options: UseTableFiltersOptions = {}
): UseTableFiltersReturn {
  const {
    initialFilters = {},
    syncWithUrl = true,
    debounceMs = 300,
  } = options;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getFiltersFromUrl = useCallback(() => {
    if (!syncWithUrl || !searchParams) return initialFilters;
    
    const filters: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('filter_')) {
        const filterKey = key.replace('filter_', '');
        filters[filterKey] = value;
      }
    });
    
    return Object.keys(filters).length > 0 ? filters : initialFilters;
  }, [searchParams, syncWithUrl, initialFilters]);

  const [filters, setFiltersState] = useState<Record<string, any>>(
    () => getFiltersFromUrl()
  );
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  // Sync state with URL when searchParams change (but not when we're the ones updating)
  useEffect(() => {
    if (syncWithUrl && searchParams) {
      const urlFilters = getFiltersFromUrl();
      setFiltersState(urlFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()]);

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const updateUrl = useCallback(
    (newFilters: Record<string, any>) => {
      if (!syncWithUrl || !searchParams || !pathname) return;

      const params = new URLSearchParams(searchParams.toString());
      
      // Remove all existing filter params
      Array.from(params.keys()).forEach((key) => {
        if (key.startsWith('filter_')) {
          params.delete(key);
        }
      });

      // Add new filter params
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.set(`filter_${key}`, String(value));
        }
      });

      // Reset to first page when filters change
      params.delete('page');

      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.push(newUrl);
    },
    [syncWithUrl, searchParams, router, pathname]
  );

  const setFilter = useCallback(
    (key: string, value: any) => {
      const newFilters = { ...filters, [key]: value };
      setFiltersState(newFilters);

      if (debounceMs > 0) {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        const timer = setTimeout(() => {
          updateUrl(newFilters);
        }, debounceMs);
        setDebounceTimer(timer);
      } else {
        updateUrl(newFilters);
      }
    },
    [filters, debounceMs, debounceTimer, updateUrl]
  );

  const setFilters = useCallback(
    (newFilters: Record<string, any>) => {
      setFiltersState(newFilters);
      updateUrl(newFilters);
    },
    [updateUrl]
  );

  const clearFilters = useCallback(() => {
    const clearedFilters: Record<string, any> = {};
    setFiltersState(clearedFilters);
    updateUrl(clearedFilters);
  }, [updateUrl]);

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== '' && value !== null && value !== undefined
  );

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    hasActiveFilters,
  };
}
