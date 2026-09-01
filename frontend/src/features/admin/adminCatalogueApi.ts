import { baseApi } from '@/app/api/baseApi';
import type {
  DestinationSummary,
  HotelSummary,
  PackageSummary,
  PackageType,
  PageResponse,
  TravelStyle,
} from '@/types/api';

/** Admin write payloads accept comma-separated strings for list-ish columns. */
export interface SaveDestinationRequest {
  name: string;
  slug: string;
  country: string;
  city?: string | null;
  region?: string | null;
  continent: string;
  shortDescription: string;
  description: string;
  heroImageUrl: string;
  thumbnailUrl?: string | null;
  rating?: number | null;
  popularityScore?: number | null;
  bestTimeToVisit?: string | null;
  averageBudget?: number | null;
  currency: string;
  latitude?: number | null;
  longitude?: number | null;
  tags?: string | null;
  featured: boolean;
  active: boolean;
}

export interface SavePackageRequest {
  title: string;
  slug: string;
  destinationSlug: string;
  destinationName: string;
  destinationCountry: string;
  summary: string;
  description: string;
  durationDays: number;
  durationNights: number;
  price: number;
  discountPrice?: number | null;
  currency: string;
  packageType: PackageType;
  travelStyle: TravelStyle;
  maxGroupSize?: number | null;
  heroImageUrl: string;
  featured: boolean;
  trending: boolean;
  active: boolean;
}

export interface SaveHotelRequest {
  name: string;
  slug: string;
  destinationSlug: string;
  destinationName: string;
  city: string;
  country: string;
  address: string;
  shortDescription: string;
  description: string;
  starRating: number;
  pricePerNight: number;
  currency: string;
  heroImageUrl: string;
  amenities?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  featured: boolean;
  active: boolean;
}

interface AdminListQuery {
  search?: string;
  page?: number;
  size?: number;
}

export const adminCatalogueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // --------------------------------------------------- destinations

    adminDestinations: builder.query<PageResponse<DestinationSummary>, AdminListQuery>({
      query: (params) => ({
        url: '/v1/admin/destinations',
        params: params as Record<string, unknown>,
      }),
      providesTags: [{ type: 'Destination', id: 'ADMIN_LIST' }],
    }),

    createDestination: builder.mutation<DestinationSummary, SaveDestinationRequest>({
      query: (body) => ({ url: '/v1/admin/destinations', method: 'POST', data: body }),
      invalidatesTags: [
        { type: 'Destination', id: 'ADMIN_LIST' },
        { type: 'Destination', id: 'LIST' },
      ],
    }),

    updateDestination: builder.mutation<
      DestinationSummary,
      { id: number; body: SaveDestinationRequest }
    >({
      query: ({ id, body }) => ({ url: `/v1/admin/destinations/${id}`, method: 'PUT', data: body }),
      invalidatesTags: [
        { type: 'Destination', id: 'ADMIN_LIST' },
        { type: 'Destination', id: 'LIST' },
      ],
    }),

    toggleDestinationStatus: builder.mutation<DestinationSummary, { id: number; active: boolean }>({
      query: ({ id, active }) => ({
        url: `/v1/admin/destinations/${id}/status`,
        method: 'PATCH',
        params: { active },
      }),
      invalidatesTags: [{ type: 'Destination', id: 'ADMIN_LIST' }],
    }),

    deleteDestination: builder.mutation<void, number>({
      query: (id) => ({ url: `/v1/admin/destinations/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Destination', id: 'ADMIN_LIST' },
        { type: 'Destination', id: 'LIST' },
      ],
    }),

    // -------------------------------------------------------- packages

    adminPackages: builder.query<PageResponse<PackageSummary>, AdminListQuery>({
      query: (params) => ({
        url: '/v1/admin/packages',
        params: params as Record<string, unknown>,
      }),
      providesTags: [{ type: 'Package', id: 'ADMIN_LIST' }],
    }),

    createPackage: builder.mutation<PackageSummary, SavePackageRequest>({
      query: (body) => ({ url: '/v1/admin/packages', method: 'POST', data: body }),
      invalidatesTags: [
        { type: 'Package', id: 'ADMIN_LIST' },
        { type: 'Package', id: 'LIST' },
      ],
    }),

    updatePackage: builder.mutation<PackageSummary, { id: number; body: SavePackageRequest }>({
      query: ({ id, body }) => ({ url: `/v1/admin/packages/${id}`, method: 'PUT', data: body }),
      invalidatesTags: [
        { type: 'Package', id: 'ADMIN_LIST' },
        { type: 'Package', id: 'LIST' },
      ],
    }),

    togglePackageStatus: builder.mutation<PackageSummary, { id: number; active: boolean }>({
      query: ({ id, active }) => ({
        url: `/v1/admin/packages/${id}/status`,
        method: 'PATCH',
        params: { active },
      }),
      invalidatesTags: [{ type: 'Package', id: 'ADMIN_LIST' }],
    }),

    deletePackage: builder.mutation<void, number>({
      query: (id) => ({ url: `/v1/admin/packages/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Package', id: 'ADMIN_LIST' },
        { type: 'Package', id: 'LIST' },
      ],
    }),

    // ---------------------------------------------------------- hotels

    adminHotels: builder.query<PageResponse<HotelSummary>, AdminListQuery>({
      query: (params) => ({ url: '/v1/admin/hotels', params: params as Record<string, unknown> }),
      providesTags: [{ type: 'Hotel', id: 'ADMIN_LIST' }],
    }),

    createHotel: builder.mutation<HotelSummary, SaveHotelRequest>({
      query: (body) => ({ url: '/v1/admin/hotels', method: 'POST', data: body }),
      invalidatesTags: [
        { type: 'Hotel', id: 'ADMIN_LIST' },
        { type: 'Hotel', id: 'LIST' },
      ],
    }),

    updateHotel: builder.mutation<HotelSummary, { id: number; body: SaveHotelRequest }>({
      query: ({ id, body }) => ({ url: `/v1/admin/hotels/${id}`, method: 'PUT', data: body }),
      invalidatesTags: [
        { type: 'Hotel', id: 'ADMIN_LIST' },
        { type: 'Hotel', id: 'LIST' },
      ],
    }),

    toggleHotelStatus: builder.mutation<HotelSummary, { id: number; active: boolean }>({
      query: ({ id, active }) => ({
        url: `/v1/admin/hotels/${id}/status`,
        method: 'PATCH',
        params: { active },
      }),
      invalidatesTags: [{ type: 'Hotel', id: 'ADMIN_LIST' }],
    }),

    deleteHotel: builder.mutation<void, number>({
      query: (id) => ({ url: `/v1/admin/hotels/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Hotel', id: 'ADMIN_LIST' },
        { type: 'Hotel', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useAdminDestinationsQuery,
  useCreateDestinationMutation,
  useUpdateDestinationMutation,
  useToggleDestinationStatusMutation,
  useDeleteDestinationMutation,
  useAdminPackagesQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useTogglePackageStatusMutation,
  useDeletePackageMutation,
  useAdminHotelsQuery,
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useToggleHotelStatusMutation,
  useDeleteHotelMutation,
} = adminCatalogueApi;
