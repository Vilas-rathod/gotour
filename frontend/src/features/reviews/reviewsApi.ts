import { baseApi } from '@/app/api/baseApi';
import type {
  CreateReviewRequest,
  ModerationStats,
  PageResponse,
  Review,
  ReviewStatus,
  ReviewSummary,
  ReviewTargetType,
} from '@/types/api';

export interface ReviewListQuery {
  targetType: ReviewTargetType;
  targetSlug: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export interface AdminReviewQuery {
  search?: string;
  status?: ReviewStatus;
  targetType?: ReviewTargetType;
  page?: number;
  size?: number;
}

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    reviews: builder.query<PageResponse<Review>, ReviewListQuery>({
      query: (params) => ({ url: '/v1/reviews', params: { ...params } }),
      providesTags: (_result, _error, { targetSlug }) => [{ type: 'Review', id: targetSlug }],
    }),

    reviewSummary: builder.query<ReviewSummary, { targetType: ReviewTargetType; targetSlug: string }>(
      {
        query: (params) => ({ url: '/v1/reviews/summary', params: { ...params } }),
        providesTags: (_result, _error, { targetSlug }) => [
          { type: 'Review', id: `${targetSlug}-summary` },
        ],
      },
    ),

    createReview: builder.mutation<Review, CreateReviewRequest>({
      query: (body) => ({ url: '/v1/reviews', method: 'POST', data: body }),
      invalidatesTags: (_result, _error, { targetSlug }) => [
        { type: 'Review', id: targetSlug },
        { type: 'Review', id: `${targetSlug}-summary` },
        { type: 'Review', id: 'MINE' },
      ],
    }),

    myReviews: builder.query<PageResponse<Review>, { page?: number; size?: number }>({
      query: (params) => ({ url: '/v1/reviews/mine', params: params as Record<string, unknown> }),
      providesTags: [{ type: 'Review', id: 'MINE' }],
    }),

    updateReview: builder.mutation<
      Review,
      { reviewId: number; rating: number; title?: string; comment: string }
    >({
      query: ({ reviewId, ...body }) => ({
        url: `/v1/reviews/${reviewId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [{ type: 'Review', id: 'MINE' }],
    }),

    deleteReview: builder.mutation<void, number>({
      query: (reviewId) => ({ url: `/v1/reviews/${reviewId}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Review', id: 'MINE' }],
    }),

    markReviewHelpful: builder.mutation<Review, { reviewId: number; targetSlug: string }>({
      query: ({ reviewId }) => ({ url: `/v1/reviews/${reviewId}/helpful`, method: 'POST' }),
      invalidatesTags: (_result, _error, { targetSlug }) => [{ type: 'Review', id: targetSlug }],
    }),

    // ------------------------------------------------------------- admin

    adminReviews: builder.query<PageResponse<Review>, AdminReviewQuery>({
      query: (params) => ({ url: '/v1/admin/reviews', params: params as Record<string, unknown> }),
      providesTags: [{ type: 'Review', id: 'ADMIN_LIST' }],
    }),

    adminReviewStats: builder.query<ModerationStats, void>({
      query: () => ({ url: '/v1/admin/reviews/stats' }),
      providesTags: [{ type: 'AdminStats', id: 'REVIEWS' }],
    }),

    moderateReview: builder.mutation<Review, { reviewId: number; status: ReviewStatus; note?: string }>(
      {
        query: ({ reviewId, ...body }) => ({
          url: `/v1/admin/reviews/${reviewId}/moderate`,
          method: 'PATCH',
          data: body,
        }),
        invalidatesTags: [
          { type: 'Review', id: 'ADMIN_LIST' },
          { type: 'AdminStats', id: 'REVIEWS' },
        ],
      },
    ),

    adminDeleteReview: builder.mutation<void, number>({
      query: (reviewId) => ({ url: `/v1/admin/reviews/${reviewId}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Review', id: 'ADMIN_LIST' },
        { type: 'AdminStats', id: 'REVIEWS' },
      ],
    }),
  }),
});

export const {
  useReviewsQuery,
  useReviewSummaryQuery,
  useCreateReviewMutation,
  useMyReviewsQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useMarkReviewHelpfulMutation,
  useAdminReviewsQuery,
  useAdminReviewStatsQuery,
  useModerateReviewMutation,
  useAdminDeleteReviewMutation,
} = reviewsApi;
