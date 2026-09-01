import { baseApi } from '@/app/api/baseApi';
import type { AppNotification, PageResponse } from '@/types/api';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    notifications: builder.query<
      PageResponse<AppNotification>,
      { unreadOnly?: boolean; page?: number; size?: number }
    >({
      query: (params) => ({ url: '/v1/notifications', params: params as Record<string, unknown> }),
      providesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    unreadNotificationCount: builder.query<number, void>({
      query: () => ({ url: '/v1/notifications/unread-count' }),
      // The endpoint returns { count: n }; callers expect a plain number.
      transformResponse: (response: { count: number }) => response?.count ?? 0,
      providesTags: [{ type: 'Notification', id: 'COUNT' }],
    }),

    markNotificationRead: builder.mutation<AppNotification, number>({
      query: (id) => ({ url: `/v1/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'COUNT' },
      ],
    }),

    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: '/v1/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'COUNT' },
      ],
    }),

    deleteNotification: builder.mutation<void, number>({
      query: (id) => ({ url: `/v1/notifications/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'COUNT' },
      ],
    }),

    clearNotifications: builder.mutation<void, void>({
      query: () => ({ url: '/v1/notifications', method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'COUNT' },
      ],
    }),
  }),
});

export const {
  useNotificationsQuery,
  useUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useClearNotificationsMutation,
} = notificationsApi;
