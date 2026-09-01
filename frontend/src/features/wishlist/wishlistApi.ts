import { baseApi } from '@/app/api/baseApi';
import type {
  PageResponse,
  SaveWishlistItemRequest,
  WishlistItem,
  WishlistItemType,
  WishlistSlugs,
  WishlistToggleResponse,
} from '@/types/api';

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    wishlist: builder.query<
      PageResponse<WishlistItem>,
      { type?: WishlistItemType; page?: number; size?: number }
    >({
      query: (params) => ({ url: '/v1/wishlist', params: params as Record<string, unknown> }),
      providesTags: [{ type: 'Wishlist', id: 'LIST' }],
    }),

    /** Saved slugs by type — powers the heart state on every card in one call. */
    wishlistSlugs: builder.query<WishlistSlugs, void>({
      query: () => ({ url: '/v1/wishlist/slugs' }),
      providesTags: [{ type: 'Wishlist', id: 'SLUGS' }],
    }),

    wishlistCount: builder.query<number, void>({
      query: () => ({ url: '/v1/wishlist/count' }),
      // The endpoint returns { count: n }; callers expect a plain number.
      transformResponse: (response: { count: number }) => response?.count ?? 0,
      providesTags: [{ type: 'Wishlist', id: 'COUNT' }],
    }),

    toggleWishlist: builder.mutation<WishlistToggleResponse, SaveWishlistItemRequest>({
      query: (body) => ({ url: '/v1/wishlist/toggle', method: 'POST', data: body }),
      invalidatesTags: [
        { type: 'Wishlist', id: 'LIST' },
        { type: 'Wishlist', id: 'SLUGS' },
        { type: 'Wishlist', id: 'COUNT' },
      ],
    }),

    removeWishlistItem: builder.mutation<void, number>({
      query: (itemId) => ({ url: `/v1/wishlist/${itemId}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Wishlist', id: 'LIST' },
        { type: 'Wishlist', id: 'SLUGS' },
        { type: 'Wishlist', id: 'COUNT' },
      ],
    }),
  }),
});

export const {
  useWishlistQuery,
  useWishlistSlugsQuery,
  useWishlistCountQuery,
  useToggleWishlistMutation,
  useRemoveWishlistItemMutation,
} = wishlistApi;
