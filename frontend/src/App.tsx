import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { sessionRestored } from '@/features/auth/authSlice';
import { themeSet } from '@/features/ui/uiSlice';
import { Toaster } from '@/components/ui/Toaster';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AppBootFallback } from '@/components/common/RouteFallback';

export function App() {
  const dispatch = useAppDispatch();
  const { initializing, sessionExpired } = useAppSelector((state) => state.auth);
  const theme = useAppSelector((state) => state.ui.theme);

  // Read the persisted session once, before any route renders.
  useEffect(() => {
    dispatch(sessionRestored());
  }, [dispatch]);

  // Keep the <html> class in step with the store (the pre-paint script sets the
  // initial value; this covers state changes after hydration).
  useEffect(() => {
    dispatch(themeSet(theme));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Surface an expired session once, rather than failing silently mid-navigation.
  useEffect(() => {
    if (sessionExpired) {
      // The router handles the redirect; this just makes the reason visible.
      console.info('[GoTour] Session expired — please sign in again.');
    }
  }, [sessionExpired]);

  if (initializing) return <AppBootFallback />;

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster />
    </ErrorBoundary>
  );
}
