import { baseApi } from '@/app/api/baseApi';
import type {
  PackageAvailability,
  PackageDetail,
  PackageFilterOptions,
  PackageQuery,
  PackageSummary,
  PageResponse,
} from '@/types/api';

export const packagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchPackages: builder.query<PageResponse<PackageSummary>, PackageQuery>({
      query: (params) => ({ url: '/v1/packages', params: params as Record<string, unknown> }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ slug }) => ({ type: 'Package' as const, id: slug })),
              { type: 'Package' as const, id: 'LIST' },
            ]
          : [{ type: 'Package' as const, id: 'LIST' }],
    }),

    featuredPackages: builder.query<PackageSummary[], void>({
      query: () => ({ url: '/v1/packages/featured' }),
      providesTags: [{ type: 'Package', id: 'FEATURED' }],
    }),

    trendingPackages: builder.query<PackageSummary[], void>({
      query: () => ({ url: '/v1/packages/trending' }),
      providesTags: [{ type: 'Package', id: 'TRENDING' }],
    }),

    packageFilters: builder.query<PackageFilterOptions, void>({
      query: () => ({ url: '/v1/packages/filters' }),
    }),

    packageBySlug: builder.query<PackageDetail, string>({
      query: (slug) => ({ url: `/v1/packages/${slug}` }),
      providesTags: (_result, _error, slug) => [{ type: 'Package', id: slug }],
    }),

    packageAvailability: builder.query<PackageAvailability[], string>({
      query: (slug) => ({ url: `/v1/packages/${slug}/availability` }),
      providesTags: (_result, _error, slug) => [{ type: 'Package', id: `${slug}-availability` }],
    }),

    relatedPackages: builder.query<PackageSummary[], string>({
      query: (slug) => ({ url: `/v1/packages/${slug}/related` }),
    }),
  }),
});

export const {
  useSearchPackagesQuery,
  useFeaturedPackagesQuery,
  useTrendingPackagesQuery,
  usePackageFiltersQuery,
  usePackageBySlugQuery,
  usePackageAvailabilityQuery,
  useRelatedPackagesQuery,
} = packagesApi;
