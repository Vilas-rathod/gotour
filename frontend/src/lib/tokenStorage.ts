import type { UserSummary } from '@/types/api';

/**
 * Single source of truth for auth token persistence.
 *
 * Tokens live in localStorage so a refresh keeps the session. The access token
 * is short lived (60 min) and the refresh token is rotated on every use by the
 * backend, which limits the blast radius of an XSS leak. A production
 * deployment should move the refresh token to an HttpOnly, SameSite=Strict
 * cookie — see docs/SECURITY.md.
 */

const ACCESS_TOKEN_KEY = 'gotour-access-token';
const REFRESH_TOKEN_KEY = 'gotour-refresh-token';
const USER_KEY = 'gotour-user';

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode / quota) — session stays in memory */
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* nothing to do */
  }
}

export const tokenStorage = {
  getAccessToken: () => safeGet(ACCESS_TOKEN_KEY),
  getRefreshToken: () => safeGet(REFRESH_TOKEN_KEY),

  getUser(): UserSummary | null {
    const raw = safeGet(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserSummary;
    } catch {
      safeRemove(USER_KEY);
      return null;
    }
  },

  setSession(accessToken: string, refreshToken: string, user: UserSummary): void {
    safeSet(ACCESS_TOKEN_KEY, accessToken);
    safeSet(REFRESH_TOKEN_KEY, refreshToken);
    safeSet(USER_KEY, JSON.stringify(user));
  },

  setTokens(accessToken: string, refreshToken: string): void {
    safeSet(ACCESS_TOKEN_KEY, accessToken);
    safeSet(REFRESH_TOKEN_KEY, refreshToken);
  },

  clear(): void {
    safeRemove(ACCESS_TOKEN_KEY);
    safeRemove(REFRESH_TOKEN_KEY);
    safeRemove(USER_KEY);
  },
};
