import { baseApi } from '@/app/api/baseApi';
import type {
  InitiatePaymentResponse,
  PageResponse,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Refund,
  RevenueStats,
  VerifyPaymentRequest,
} from '@/types/api';

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    initiatePayment: builder.mutation<
      InitiatePaymentResponse,
      { bookingReference: string; method: PaymentMethod }
    >({
      query: (body) => ({ url: '/v1/payments/initiate', method: 'POST', data: body }),
      // A cash reservation confirms the booking server-side with no verify step,
      // so refresh the affected booking and payment views immediately.
      invalidatesTags: (_result, _error, { bookingReference }) => [
        { type: 'Booking', id: bookingReference },
        { type: 'Booking', id: 'LIST' },
        { type: 'Payment', id: bookingReference },
        { type: 'Payment', id: 'LIST' },
      ],
    }),

    verifyPayment: builder.mutation<Payment, VerifyPaymentRequest>({
      query: (body) => ({ url: '/v1/payments/verify', method: 'POST', data: body }),
      invalidatesTags: [
        { type: 'Payment', id: 'LIST' },
        { type: 'Booking', id: 'LIST' },
      ],
    }),

    myPayments: builder.query<PageResponse<Payment>, { page?: number; size?: number }>({
      query: (params) => ({ url: '/v1/payments', params: params as Record<string, unknown> }),
      providesTags: [{ type: 'Payment', id: 'LIST' }],
    }),

    paymentForBooking: builder.query<Payment, string>({
      query: (bookingReference) => ({ url: `/v1/payments/booking/${bookingReference}` }),
      providesTags: (_result, _error, reference) => [{ type: 'Payment', id: reference }],
    }),

    // ------------------------------------------------------------- admin

    adminPayments: builder.query<
      PageResponse<Payment>,
      { search?: string; status?: PaymentStatus; page?: number; size?: number }
    >({
      query: (params) => ({ url: '/v1/admin/payments', params: params as Record<string, unknown> }),
      providesTags: [{ type: 'Payment', id: 'ADMIN_LIST' }],
    }),

    adminRevenueStats: builder.query<RevenueStats, void>({
      query: () => ({ url: '/v1/admin/payments/stats' }),
      providesTags: [{ type: 'AdminStats', id: 'REVENUE' }],
    }),

    refundPayment: builder.mutation<
      Refund,
      { paymentReference: string; amount: number; reason: string }
    >({
      query: ({ paymentReference, ...body }) => ({
        url: `/v1/admin/payments/${paymentReference}/refund`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [
        { type: 'Payment', id: 'ADMIN_LIST' },
        { type: 'AdminStats', id: 'REVENUE' },
        { type: 'Booking', id: 'ADMIN_LIST' },
      ],
    }),
  }),
});

export const {
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
  useMyPaymentsQuery,
  usePaymentForBookingQuery,
  useAdminPaymentsQuery,
  useAdminRevenueStatsQuery,
  useRefundPaymentMutation,
} = paymentsApi;
