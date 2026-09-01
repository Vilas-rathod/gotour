import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Reads and writes filter state through the URL so results are shareable,
 * bookmarkable and survive a back/forward navigation.
 */
export function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getString = useCallback(
    (key: string, fallback = ''): string => searchParams.get(key) ?? fallback,
    [searchParams],
  );

  const getNumber = useCallback(
    (key: string): number | undefined => {
      const raw = searchParams.get(key);
      if (raw === null || raw === '') return undefined;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : undefined;
    },
    [searchParams],
  );

  /** Sets many params at once; empty/undefined values are removed. */
  const setParams = useCallback(
    (updates: Record<string, string | number | boolean | undefined | null>, resetPage = true) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);

          for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === null || value === '' || value === false) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          }

          // Any filter change invalidates the current page offset.
          if (resetPage && !('page' in updates)) next.delete('page');

          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setSearchParams],
  );

  const clearParams = useCallback(
    (keep: string[] = []) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams();
          for (const key of keep) {
            const value = current.get(key);
            if (value) next.set(key, value);
          }
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setSearchParams],
  );

  /** Count of filters in play, used to badge the mobile filter button. */
  const activeFilterCount = useMemo(() => {
    const ignored = new Set(['page', 'size', 'sortBy', 'direction']);
    let count = 0;
    searchParams.forEach((_value, key) => {
      if (!ignored.has(key)) count += 1;
    });
    return count;
  }, [searchParams]);

  return { searchParams, getString, getNumber, setParams, clearParams, activeFilterCount };
}
