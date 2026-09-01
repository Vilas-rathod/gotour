import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { tokenStorage } from './tokenStorage';
import type { ApiResponse, AuthResponse } from '@/types/api';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** Paths that must never carry an Authorization header or trigger a refresh. */
const PUBLIC_AUTH_PATHS = [
  '/v1/auth/login',
  '/v1/auth/register',
  '/v1/auth/refresh',
  '/v1/auth/forgot-password',
  '/v1/auth/reset-password',
];

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Called when the refresh token is rejected. The store registers a handler here
 * rather than being imported directly, which keeps this module free of Redux
 * imports and avoids a require cycle.
 */
let onSessionExpired: (() => void) | null = null;

export function registerSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

// ---------------------------------------------------------------- request

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const url = config.url ?? '';
  const isPublic = PUBLIC_AUTH_PATHS.some((path) => url.startsWith(path));
  const token = tokenStorage.getAccessToken();

  if (token && !isPublic) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// ---------------------------------------------------------------- response

/**
 * A single in-flight refresh shared by every 401'd request, so a burst of
 * parallel calls produces one refresh instead of N competing ones (each of
 * which would invalidate the others thanks to server-side token rotation).
 */
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  // A bare client: the shared instance would recurse through this interceptor.
  const { data } = await axios.post<ApiResponse<AuthResponse>>(
    `${API_BASE_URL}/v1/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' }, timeout: 20_000 },
  );

  const payload = data.data;
  tokenStorage.setTokens(payload.accessToken, payload.refreshToken);
  return payload.accessToken;
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = config?.url ?? '';
    const isPublic = PUBLIC_AUTH_PATHS.some((path) => url.startsWith(path));

    const shouldRefresh =
      status === 401 && config && !config._retried && !isPublic && tokenStorage.getRefreshToken();

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    config._retried = true;

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const token = await refreshPromise;
      config.headers.set('Authorization', `Bearer ${token}`);
      return await http.request(config);
    } catch (refreshError) {
      tokenStorage.clear();
      onSessionExpired?.();
      return Promise.reject(refreshError);
    }
  },
);

// ------------------------------------------------------------ error shaping

export interface NormalizedApiError {
  status: number;
  message: string;
  errors?: Record<string, string> | string[] | null;
}

/** Turns any thrown value into the one error shape the UI renders. */
export function normalizeError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiResponse<unknown> | undefined;

    if (!error.response) {
      return {
        status: 0,
        message: 'Cannot reach the GoTour servers. Check your connection and try again.',
      };
    }

    return {
      status: error.response.status,
      message: body?.message ?? error.message ?? 'Something went wrong.',
      errors: body?.errors ?? null,
    };
  }

  if (error instanceof Error) {
    return { status: 0, message: error.message };
  }
  return { status: 0, message: 'An unexpected error occurred.' };
}

/** Unwraps the `ApiResponse` envelope so callers work with the payload only. */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await http.request<ApiResponse<T>>(config);
  return response.data.data;
}
