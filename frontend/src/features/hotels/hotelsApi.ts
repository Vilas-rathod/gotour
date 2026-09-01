import { baseApi } from '@/app/api/baseApi';
import type {
  HotelDetail,
  HotelFilterOptions,
  HotelQuery,
  HotelRoom,
  HotelSummary,
  PageResponse,
} from '@/types/api';

export const hotelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchHotels: builder.query<PageResponse<HotelSummary>, HotelQuery>({
      query: (params) => ({ url: '/v1/hotels', params: params as Record<string, unknown> }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ slug }) => ({ type: 'Hotel' as const, id: slug })),
              { type: 'Hotel' as const, id: 'LIST' },
            ]
          : [{ type: 'Hotel' as const, id: 'LIST' }],
    }),

    featuredHotels: builder.query<HotelSummary[], void>({
      query: () => ({ url: '/v1/hotels/featured' }),
      providesTags: [{ type: 'Hotel', id: 'FEATURED' }],
    }),

    hotelFilters: builder.query<HotelFilterOptions, void>({
      query: () => ({ url: '/v1/hotels/filters' }),
    }),

    hotelBySlug: builder.query<HotelDetail, string>({
      query: (slug) => ({ url: `/v1/hotels/${slug}` }),
      providesTags: (_result, _error, slug) => [{ type: 'Hotel', id: slug }],
    }),

    hotelRooms: builder.query<HotelRoom[], string>({
      query: (slug) => ({ url: `/v1/hotels/${slug}/rooms` }),
      providesTags: (_result, _error, slug) => [{ type: 'Hotel', id: `${slug}-rooms` }],
    }),
  }),
});

export const {
  useSearchHotelsQuery,
  useFeaturedHotelsQuery,
  useHotelFiltersQuery,
  useHotelBySlugQuery,
  useHotelRoomsQuery,
} = hotelsApi;
