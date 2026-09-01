import { baseApi } from '@/app/api/baseApi';
import type {
  ActivityCategory,
  ItineraryDetail,
  ItinerarySummary,
  PageResponse,
  SaveItineraryRequest,
} from '@/types/api';

export interface SaveDayRequest {
  dayNumber: number;
  date?: string | null;
  title: string;
  description?: string | null;
}

export interface SaveActivityRequest {
  startTime?: string | null;
  title: string;
  description?: string | null;
  location?: string | null;
  category: ActivityCategory;
}

export const itinerariesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    itineraries: builder.query<PageResponse<ItinerarySummary>, { page?: number; size?: number }>({
      query: (params) => ({ url: '/v1/itineraries', params: params as Record<string, unknown> }),
      providesTags: [{ type: 'Itinerary', id: 'LIST' }],
    }),

    upcomingItineraries: builder.query<ItinerarySummary[], void>({
      query: () => ({ url: '/v1/itineraries/upcoming' }),
      providesTags: [{ type: 'Itinerary', id: 'UPCOMING' }],
    }),

    itinerary: builder.query<ItineraryDetail, number>({
      query: (id) => ({ url: `/v1/itineraries/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Itinerary', id }],
    }),

    createItinerary: builder.mutation<ItineraryDetail, SaveItineraryRequest>({
      query: (body) => ({ url: '/v1/itineraries', method: 'POST', data: body }),
      invalidatesTags: [
        { type: 'Itinerary', id: 'LIST' },
        { type: 'Itinerary', id: 'UPCOMING' },
      ],
    }),

    updateItinerary: builder.mutation<
      ItineraryDetail,
      { id: number; body: SaveItineraryRequest }
    >({
      query: ({ id, body }) => ({ url: `/v1/itineraries/${id}`, method: 'PUT', data: body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Itinerary', id },
        { type: 'Itinerary', id: 'LIST' },
      ],
    }),

    deleteItinerary: builder.mutation<void, number>({
      query: (id) => ({ url: `/v1/itineraries/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Itinerary', id: 'LIST' },
        { type: 'Itinerary', id: 'UPCOMING' },
      ],
    }),

    addItineraryDay: builder.mutation<ItineraryDetail, { id: number; body: SaveDayRequest }>({
      query: ({ id, body }) => ({ url: `/v1/itineraries/${id}/days`, method: 'POST', data: body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Itinerary', id }],
    }),

    updateItineraryDay: builder.mutation<
      ItineraryDetail,
      { id: number; dayId: number; body: SaveDayRequest }
    >({
      query: ({ id, dayId, body }) => ({
        url: `/v1/itineraries/${id}/days/${dayId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Itinerary', id }],
    }),

    deleteItineraryDay: builder.mutation<ItineraryDetail, { id: number; dayId: number }>({
      query: ({ id, dayId }) => ({ url: `/v1/itineraries/${id}/days/${dayId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Itinerary', id }],
    }),

    addItineraryActivity: builder.mutation<
      ItineraryDetail,
      { id: number; dayId: number; body: SaveActivityRequest }
    >({
      query: ({ id, dayId, body }) => ({
        url: `/v1/itineraries/${id}/days/${dayId}/activities`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Itinerary', id }],
    }),

    updateItineraryActivity: builder.mutation<
      ItineraryDetail,
      { id: number; dayId: number; activityId: number; body: SaveActivityRequest }
    >({
      query: ({ id, dayId, activityId, body }) => ({
        url: `/v1/itineraries/${id}/days/${dayId}/activities/${activityId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Itinerary', id }],
    }),

    toggleItineraryActivity: builder.mutation<
      ItineraryDetail,
      { id: number; dayId: number; activityId: number }
    >({
      query: ({ id, dayId, activityId }) => ({
        url: `/v1/itineraries/${id}/days/${dayId}/activities/${activityId}/toggle`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Itinerary', id }],
    }),

    deleteItineraryActivity: builder.mutation<
      ItineraryDetail,
      { id: number; dayId: number; activityId: number }
    >({
      query: ({ id, dayId, activityId }) => ({
        url: `/v1/itineraries/${id}/days/${dayId}/activities/${activityId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Itinerary', id }],
    }),
  }),
});

export const {
  useItinerariesQuery,
  useUpcomingItinerariesQuery,
  useItineraryQuery,
  useCreateItineraryMutation,
  useUpdateItineraryMutation,
  useDeleteItineraryMutation,
  useAddItineraryDayMutation,
  useUpdateItineraryDayMutation,
  useDeleteItineraryDayMutation,
  useAddItineraryActivityMutation,
  useUpdateItineraryActivityMutation,
  useToggleItineraryActivityMutation,
  useDeleteItineraryActivityMutation,
} = itinerariesApi;
