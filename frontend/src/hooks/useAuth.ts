import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { hasRole, loggedOut } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/features/auth/authApi';
import { baseApi } from '@/app/api/baseApi';
import { tokenStorage } from '@/lib/tokenStorage';

/** Session state plus a logout that also clears the RTK Query cache. */
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, initializing } = useAppSelector((state) => state.auth);
  const [logoutMutation] = useLogoutMutation();

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      // Best effort: the server revokes the token, but the client logs out either way.
      try {
        await logoutMutation({ refreshToken }).unwrap();
      } catch {
        /* already expired or offline */
      }
    }
    dispatch(loggedOut());
    dispatch(baseApi.util.resetApiState());
  }, [dispatch, logoutMutation]);

  return {
    user,
    isAuthenticated,
    initializing,
    isAdmin: hasRole(user, 'ADMIN'),
    logout,
  };
}
