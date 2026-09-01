import { baseApi } from '@/app/api/baseApi';
import type {
  Address,
  AddressRequest,
  AdminUser,
  CustomerGrowth,
  PageResponse,
  UpdateProfileRequest,
  UserProfile,
} from '@/types/api';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    profile: builder.query<UserProfile, void>({
      query: () => ({ url: '/v1/users/me' }),
      providesTags: [{ type: 'Profile', id: 'ME' }],
    }),

    updateProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
      query: (body) => ({ url: '/v1/users/me', method: 'PUT', data: body }),
      invalidatesTags: [{ type: 'Profile', id: 'ME' }],
    }),

    addresses: builder.query<Address[], void>({
      query: () => ({ url: '/v1/users/me/addresses' }),
      providesTags: [{ type: 'Address', id: 'LIST' }],
    }),

    createAddress: builder.mutation<Address, AddressRequest>({
      query: (body) => ({ url: '/v1/users/me/addresses', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),

    updateAddress: builder.mutation<Address, { id: number; body: AddressRequest }>({
      query: ({ id, body }) => ({
        url: `/v1/users/me/addresses/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),

    deleteAddress: builder.mutation<void, number>({
      query: (id) => ({ url: `/v1/users/me/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),

    // ------------------------------------------------------------- admin

    adminUsers: builder.query<
      PageResponse<AdminUser>,
      { search?: string; page?: number; size?: number }
    >({
      query: (params) => ({ url: '/v1/admin/users', params: params as Record<string, unknown> }),
      providesTags: [{ type: 'Profile', id: 'ADMIN_LIST' }],
    }),

    adminCustomerGrowth: builder.query<CustomerGrowth, void>({
      query: () => ({ url: '/v1/admin/users/stats' }),
      providesTags: [{ type: 'AdminStats', id: 'CUSTOMERS' }],
    }),
  }),
});

export const {
  useProfileQuery,
  useUpdateProfileMutation,
  useAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useAdminUsersQuery,
  useAdminCustomerGrowthQuery,
} = profileApi;
