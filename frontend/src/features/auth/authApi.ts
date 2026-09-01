import { baseApi } from '@/app/api/baseApi';
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UserSummary,
} from '@/types/api';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/v1/auth/login', method: 'POST', data: body }),
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: '/v1/auth/register', method: 'POST', data: body }),
    }),

    logout: builder.mutation<void, { refreshToken: string }>({
      query: (body) => ({ url: '/v1/auth/logout', method: 'POST', data: body }),
    }),

    logoutAll: builder.mutation<void, void>({
      query: () => ({ url: '/v1/auth/logout-all', method: 'POST' }),
    }),

    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({ url: '/v1/auth/forgot-password', method: 'POST', data: body }),
    }),

    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (body) => ({ url: '/v1/auth/reset-password', method: 'POST', data: body }),
    }),

    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({ url: '/v1/auth/change-password', method: 'POST', data: body }),
    }),

    currentUser: builder.query<UserSummary, void>({
      query: () => ({ url: '/v1/auth/me' }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useLogoutAllMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useCurrentUserQuery,
} = authApi;
