import { beforeEach, describe, expect, it } from 'vitest';
import {
  authReducer,
  credentialsReceived,
  hasRole,
  loggedOut,
  sessionExpired,
  sessionRestored,
  userUpdated,
  type AuthState,
} from './authSlice';
import { tokenStorage } from '@/lib/tokenStorage';
import type { AuthResponse, UserSummary } from '@/types/api';

const USER: UserSummary = {
  id: 1,
  email: 'priya@example.com',
  fullName: 'Priya Sharma',
  phone: '+91 98765 43210',
  roles: ['CUSTOMER'],
  createdAt: '2026-01-15T10:00:00Z',
};

const AUTH_RESPONSE: AuthResponse = {
  accessToken: 'access-token-value',
  refreshToken: 'refresh-token-value',
  tokenType: 'Bearer',
  expiresInSeconds: 3600,
  user: USER,
};

const INITIAL: AuthState = {
  user: null,
  isAuthenticated: false,
  initializing: true,
  sessionExpired: false,
};

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores tokens and the user when credentials arrive', () => {
    const state = authReducer(INITIAL, credentialsReceived(AUTH_RESPONSE));

    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('priya@example.com');
    expect(state.initializing).toBe(false);
    expect(tokenStorage.getAccessToken()).toBe('access-token-value');
    expect(tokenStorage.getRefreshToken()).toBe('refresh-token-value');
  });

  it('restores a persisted session on boot', () => {
    tokenStorage.setSession('a', 'r', USER);

    const state = authReducer(INITIAL, sessionRestored());

    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.fullName).toBe('Priya Sharma');
    expect(state.initializing).toBe(false);
  });

  it('finishes initializing even when nothing is persisted', () => {
    const state = authReducer(INITIAL, sessionRestored());

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.initializing).toBe(false);
  });

  it('does not restore a user when the access token is missing', () => {
    // A partially cleared storage must not produce a half-authenticated state.
    localStorage.setItem('gotour-user', JSON.stringify(USER));

    const state = authReducer(INITIAL, sessionRestored());

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('clears everything and flags expiry when the session expires', () => {
    const signedIn = authReducer(INITIAL, credentialsReceived(AUTH_RESPONSE));
    const state = authReducer(signedIn, sessionExpired());

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.sessionExpired).toBe(true);
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it('clears storage on logout without flagging expiry', () => {
    const signedIn = authReducer(INITIAL, credentialsReceived(AUTH_RESPONSE));
    const state = authReducer(signedIn, loggedOut());

    expect(state.isAuthenticated).toBe(false);
    expect(state.sessionExpired).toBe(false);
    expect(tokenStorage.getUser()).toBeNull();
  });

  it('merges profile edits into the persisted user', () => {
    const signedIn = authReducer(INITIAL, credentialsReceived(AUTH_RESPONSE));
    const state = authReducer(signedIn, userUpdated({ fullName: 'Priya S. Rao' }));

    expect(state.user?.fullName).toBe('Priya S. Rao');
    expect(state.user?.email).toBe('priya@example.com');
    expect(tokenStorage.getUser()?.fullName).toBe('Priya S. Rao');
  });

  it('ignores profile edits when nobody is signed in', () => {
    const state = authReducer(INITIAL, userUpdated({ fullName: 'Nobody' }));
    expect(state.user).toBeNull();
  });
});

describe('hasRole', () => {
  it('detects an assigned role', () => {
    expect(hasRole(USER, 'CUSTOMER')).toBe(true);
  });

  it('returns false for a role the user lacks', () => {
    expect(hasRole(USER, 'ADMIN')).toBe(false);
  });

  it('returns false for a null user', () => {
    expect(hasRole(null, 'ADMIN')).toBe(false);
  });
});

describe('tokenStorage', () => {
  beforeEach(() => localStorage.clear());

  it('returns null and self-heals when the stored user is corrupt', () => {
    localStorage.setItem('gotour-user', '{not-json');

    expect(tokenStorage.getUser()).toBeNull();
    expect(localStorage.getItem('gotour-user')).toBeNull();
  });
});
