import { baseApi } from '@/app/api/baseApi';
import type {
  BookingDetail,
  BookingStats,
  BookingStatus,
  BookingSummary,
  BookingType,
  CreateBookingRequest,
  Invoice,
  PageResponse,
} from '@/types/api';

export interface AdminBookingQuery {
  search?: string;
  status?: BookingStatus;
  type?: BookingType;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation<BookingDetail, CreateBookingRequest>({
      query: (body) => ({ url: '/v1/bookings', method: 'POST', data: body }),
      invalidatesTags: [
        { type: 'Booking', id: 'LIST' },
        { type: 'Package', id: 'LIST' },
        { type: 'Hotel', id: 'LIST' },
      ],
    }),

    myBookings: builder.query<PageResponse<BookingSummary>, { page?: number; size?: number }>({
      query: (params) => ({ url: '/v1/bookings', params: params as Record<string, unknown> }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ bookingReference }) => ({
                type: 'Booking' as const,
                id: bookingReference,
              })),
              { type: 'Booking' as const, id: 'LIST' },
            ]
          : [{ type: 'Booking' as const, id: 'LIST' }],
    }),

    bookingByReference: builder.query<BookingDetail, string>({
      query: (reference) => ({ url: `/v1/bookings/${reference}` }),
      providesTags: (_result, _error, reference) => [{ type: 'Booking', id: reference }],
    }),

    bookingInvoice: builder.query<Invoice, string>({
      query: (reference) => ({ url: `/v1/bookings/${reference}/invoice` }),
    }),

    cancelBooking: builder.mutation<BookingDetail, { reference: string; reason: string }>({
      query: ({ reference, reason }) => ({
        url: `/v1/bookings/${reference}/cancel`,
        method: 'POST',
        data: { reason },
      }),
      invalidatesTags: (_result, _error, { reference }) => [
        { type: 'Booking', id: reference },
        { type: 'Booking', id: 'LIST' },
      ],
    }),

    // ------------------------------------------------------------- admin

    adminBookings: builder.query<PageResponse<BookingSummary>, AdminBookingQuery>({
      query: (params) => ({ url: '/v1/admin/bookings', params: params as Record<string, unknown> }),
      providesTags: [{ type: 'Booking', id: 'ADMIN_LIST' }],
    }),

    adminBookingStats: builder.query<BookingStats, void>({
      query: () => ({ url: '/v1/admin/bookings/stats' }),
      providesTags: [{ type: 'AdminStats', id: 'BOOKINGS' }],
    }),

    adminBookingByReference: builder.query<BookingDetail, string>({
      query: (reference) => ({ url: `/v1/admin/bookings/${reference}` }),
      providesTags: (_result, _error, reference) => [{ type: 'Booking', id: reference }],
    }),

    adminUpdateBookingStatus: builder.mutation<
      BookingDetail,
      { reference: string; status: BookingStatus }
    >({
      query: ({ reference, status }) => ({
        url: `/v1/admin/bookings/${reference}/status`,
        method: 'PATCH',
        params: { status },
      }),
      invalidatesTags: (_result, _error, { reference }) => [
        { type: 'Booking', id: reference },
        { type: 'Booking', id: 'ADMIN_LIST' },
        { type: 'AdminStats', id: 'BOOKINGS' },
      ],
    }),

    adminCancelBooking: builder.mutation<BookingDetail, { reference: string; reason: string }>({
      query: ({ reference, reason }) => ({
        url: `/v1/admin/bookings/${reference}/cancel`,
        method: 'POST',
        data: { reason },
      }),
      invalidatesTags: (_result, _error, { reference }) => [
        { type: 'Booking', id: reference },
        { type: 'Booking', id: 'ADMIN_LIST' },
        { type: 'AdminStats', id: 'BOOKINGS' },
      ],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useMyBookingsQuery,
  useBookingByReferenceQuery,
  useBookingInvoiceQuery,
  useLazyBookingInvoiceQuery,
  useCancelBookingMutation,
  useAdminBookingsQuery,
  useAdminBookingStatsQuery,
  useAdminBookingByReferenceQuery,
  useAdminUpdateBookingStatusMutation,
  useAdminCancelBookingMutation,
} = bookingsApi;
