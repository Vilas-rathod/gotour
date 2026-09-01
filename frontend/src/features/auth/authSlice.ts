import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { tokenStorage } from '@/lib/tokenStorage';
import type { AuthResponse, RoleName, UserSummary } from '@/types/api';

export interface AuthState {
  user: UserSummary | null;
  isAuthenticated: boolean;
  /** True until the persisted session has been read on first mount. */
  initializing: boolean;
  sessionExpired: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  initializing: true,
  sessionExpired: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Rehydrates from localStorage on app boot. */
    sessionRestored(state) {
      const user = tokenStorage.getUser();
      const token = tokenStorage.getAccessToken();
      state.user = token ? user : null;
      state.isAuthenticated = Boolean(token && user);
      state.initializing = false;
    },

    credentialsReceived(state, action: PayloadAction<AuthResponse>) {
      const { accessToken, refreshToken, user } = action.payload;
      tokenStorage.setSession(accessToken, refreshToken, user);
      state.user = user;
      state.isAuthenticated = true;
      state.sessionExpired = false;
      state.initializing = false;
    },

    userUpdated(state, action: PayloadAction<Partial<UserSummary>>) {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();
      if (accessToken && refreshToken) {
        tokenStorage.setSession(accessToken, refreshToken, state.user);
      }
    },

    /** Refresh failed or the token was rejected — force a re-login. */
    sessionExpired(state) {
      tokenStorage.clear();
      state.user = null;
      state.isAuthenticated = false;
      state.sessionExpired = true;
      state.initializing = false;
    },

    loggedOut(state) {
      tokenStorage.clear();
      state.user = null;
      state.isAuthenticated = false;
      state.sessionExpired = false;
      state.initializing = false;
    },
  },
});

export const { sessionRestored, credentialsReceived, userUpdated, sessionExpired, loggedOut } =
  authSlice.actions;

export const authReducer = authSlice.reducer;

// ------------------------------------------------------------------ helpers

export function hasRole(user: UserSummary | null, role: RoleName): boolean {
  return Boolean(user?.roles?.includes(role));
}
