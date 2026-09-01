import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AccountLayout } from '@/pages/account/AccountLayout';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

/**
 * Every page is a lazy chunk so the initial bundle carries only the shell.
 * The layouts themselves are eager — they render on every route anyway.
 */

// public
const HomePage = lazy(() => import('@/pages/home/HomePage'));
const DestinationsPage = lazy(() => import('@/pages/destinations/DestinationsPage'));
const DestinationDetailPage = lazy(() => import('@/pages/destinations/DestinationDetailPage'));
const PackagesPage = lazy(() => import('@/pages/packages/PackagesPage'));
const PackageDetailPage = lazy(() => import('@/pages/packages/PackageDetailPage'));
const HotelsPage = lazy(() => import('@/pages/hotels/HotelsPage'));
const HotelDetailPage = lazy(() => import('@/pages/hotels/HotelDetailPage'));
const SearchPage = lazy(() => import('@/pages/search/SearchPage'));
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'));
const ForbiddenPage = lazy(() => import('@/pages/errors/ForbiddenPage'));

// auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

// checkout
const CheckoutPage = lazy(() => import('@/pages/checkout/CheckoutPage'));
const BookingConfirmedPage = lazy(() => import('@/pages/checkout/BookingConfirmedPage'));

// account
const MyBookingsPage = lazy(() => import('@/pages/account/MyBookingsPage'));
const BookingDetailPage = lazy(() => import('@/pages/account/BookingDetailPage'));
const WishlistPage = lazy(() => import('@/pages/account/WishlistPage'));
const ItinerariesPage = lazy(() => import('@/pages/account/ItinerariesPage'));
const ItineraryDetailPage = lazy(() => import('@/pages/account/ItineraryDetailPage'));
const MyReviewsPage = lazy(() => import('@/pages/account/MyReviewsPage'));
const NotificationsPage = lazy(() => import('@/pages/account/NotificationsPage'));
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'));

// admin
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminDestinationsPage = lazy(() => import('@/pages/admin/AdminDestinationsPage'));
const AdminPackagesPage = lazy(() => import('@/pages/admin/AdminPackagesPage'));
const AdminHotelsPage = lazy(() => import('@/pages/admin/AdminHotelsPage'));
const AdminBookingsPage = lazy(() => import('@/pages/admin/AdminBookingsPage'));
const AdminPaymentsPage = lazy(() => import('@/pages/admin/AdminPaymentsPage'));
const AdminReviewsPage = lazy(() => import('@/pages/admin/AdminReviewsPage'));
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'));

export const router = createBrowserRouter([
  // ---------------------------------------------------- auth (no chrome)
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  // ------------------------------------------------------------ storefront
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },

      { path: 'destinations', element: <DestinationsPage /> },
      { path: 'destinations/:slug', element: <DestinationDetailPage /> },

      { path: 'packages', element: <PackagesPage /> },
      { path: 'packages/:slug', element: <PackageDetailPage /> },

      { path: 'hotels', element: <HotelsPage /> },
      { path: 'hotels/:slug', element: <HotelDetailPage /> },

      { path: 'search', element: <SearchPage /> },

      // -------------------------------------------- signed-in checkout
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'checkout/:type/:slug', element: <CheckoutPage /> },
          { path: 'booking-confirmed/:reference', element: <BookingConfirmedPage /> },
        ],
      },

      // ---------------------------------------------------- my account
      {
        path: 'account',
        element: <ProtectedRoute />,
        children: [
          {
            element: <AccountLayout />,
            children: [
              { index: true, element: <Navigate to="/account/bookings" replace /> },
              { path: 'bookings', element: <MyBookingsPage /> },
              { path: 'bookings/:reference', element: <BookingDetailPage /> },
              { path: 'wishlist', element: <WishlistPage /> },
              { path: 'itineraries', element: <ItinerariesPage /> },
              { path: 'itineraries/:id', element: <ItineraryDetailPage /> },
              { path: 'reviews', element: <MyReviewsPage /> },
              { path: 'notifications', element: <NotificationsPage /> },
              { path: 'profile', element: <ProfilePage /> },
            ],
          },
        ],
      },

      { path: '403', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // ---------------------------------------------------------- admin portal
  {
    path: '/admin',
    element: <ProtectedRoute requireAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'destinations', element: <AdminDestinationsPage /> },
          { path: 'packages', element: <AdminPackagesPage /> },
          { path: 'hotels', element: <AdminHotelsPage /> },
          { path: 'bookings', element: <AdminBookingsPage /> },
          { path: 'payments', element: <AdminPaymentsPage /> },
          { path: 'reviews', element: <AdminReviewsPage /> },
          { path: 'customers', element: <AdminCustomersPage /> },
        ],
      },
    ],
  },
]);
