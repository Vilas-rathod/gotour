import { baseApi } from '@/app/api/baseApi';
import type {
  DestinationDetail,
  DestinationFacets,
  DestinationQuery,
  DestinationSummary,
  PageResponse,
} from '@/types/api';

export const destinationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchDestinations: builder.query<PageResponse<DestinationSummary>, DestinationQuery>({
      query: (params) => ({ url: '/v1/destinations', params: params as Record<string, unknown> }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ slug }) => ({ type: 'Destination' as const, id: slug })),
              { type: 'Destination' as const, id: 'LIST' },
            ]
          : [{ type: 'Destination' as const, id: 'LIST' }],
    }),

    featuredDestinations: builder.query<DestinationSummary[], void>({
      query: () => ({ url: '/v1/destinations/featured' }),
      providesTags: [{ type: 'Destination', id: 'FEATURED' }],
    }),

    popularDestinations: builder.query<DestinationSummary[], void>({
      query: () => ({ url: '/v1/destinations/popular' }),
      providesTags: [{ type: 'Destination', id: 'POPULAR' }],
    }),

    destinationFacets: builder.query<DestinationFacets, void>({
      query: () => ({ url: '/v1/destinations/facets' }),
    }),

    destinationBySlug: builder.query<DestinationDetail, string>({
      query: (slug) => ({ url: `/v1/destinations/${slug}` }),
      providesTags: (_result, _error, slug) => [{ type: 'Destination', id: slug }],
    }),

    relatedDestinations: builder.query<DestinationSummary[], string>({
      query: (slug) => ({ url: `/v1/destinations/${slug}/related` }),
    }),
  }),
});

export const {
  useSearchDestinationsQuery,
  useFeaturedDestinationsQuery,
  usePopularDestinationsQuery,
  useDestinationFacetsQuery,
  useDestinationBySlugQuery,
  useRelatedDestinationsQuery,
} = destinationsApi;
