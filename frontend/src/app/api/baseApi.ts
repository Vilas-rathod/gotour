import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery';

/**
 * Single RTK Query API slice. Feature slices attach their endpoints with
 * `injectEndpoints`, which keeps one cache, one middleware and lets routes be
 * code-split without pulling every endpoint into the initial bundle.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Destination',
    'Package',
    'Hotel',
    'Booking',
    'Payment',
    'Wishlist',
    'Review',
    'Notification',
    'Itinerary',
    'Profile',
    'Address',
    'AdminStats',
  ],
  // Travel inventory changes slowly; a minute of cache keeps navigation instant.
  keepUnusedDataFor: 60,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
