import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppBootFallback } from '@/components/common/RouteFallback';

export interface ProtectedRouteProps {
  /** When set, the user must also hold this role. */
  requireAdmin?: boolean;
}

/**
 * Route guard. Waits for the persisted session to be read before deciding, so
 * a page refresh on a private route does not bounce the user to login.
 */
export function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <AppBootFallback />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
