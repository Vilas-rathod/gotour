import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig } from 'axios';
import { http, normalizeError, type NormalizedApiError } from '@/lib/http';
import type { ApiResponse } from '@/types/api';

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: AxiosRequestConfig['headers'];
}

/**
 * RTK Query transport backed by the shared axios instance, so every cached
 * query goes through the same auth header injection, refresh-on-401 retry and
 * error normalization as imperative calls. The `ApiResponse` envelope is
 * unwrapped here — endpoints deal in payloads, never the wrapper.
 */
export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, NormalizedApiError> =>
  async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await http.request<ApiResponse<unknown>>({
        url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data?.data ?? null };
    } catch (error) {
      return { error: normalizeError(error) };
    }
  };
