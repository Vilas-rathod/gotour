import { useCallback } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { toastPushed } from '@/features/ui/uiSlice';
import type { NormalizedApiError } from '@/lib/http';

/** Thin wrapper so components raise toasts without touching Redux directly. */
export function useToast() {
  const dispatch = useAppDispatch();

  const success = useCallback(
    (title: string, description?: string) =>
      dispatch(toastPushed({ title, description, variant: 'success' })),
    [dispatch],
  );

  const error = useCallback(
    (title: string, description?: string) =>
      dispatch(toastPushed({ title, description, variant: 'error' })),
    [dispatch],
  );

  const info = useCallback(
    (title: string, description?: string) =>
      dispatch(toastPushed({ title, description, variant: 'info' })),
    [dispatch],
  );

  /** Renders whatever an RTK Query mutation rejected with. */
  const apiError = useCallback(
    (err: unknown, fallback = 'Something went wrong') => {
      const normalized = err as Partial<NormalizedApiError> | undefined;
      dispatch(
        toastPushed({
          title: fallback,
          description: normalized?.message,
          variant: 'error',
        }),
      );
    },
    [dispatch],
  );

  return { success, error, info, apiError };
}
