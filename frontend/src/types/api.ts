/**
 * TypeScript mirror of the backend DTO contracts.
 * Kept 1:1 with the Java records so a contract change surfaces as a type error.
 */

// ---------------------------------------------------------------- envelopes

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string> | string[] | null;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ------------------------------------------------------------------- enums

export type RoleName = 'ADMIN' | 'CUSTOMER';

export type PackageType =
  | 'GROUP'
  | 'PRIVATE'
  | 'HONEYMOON'
  | 'FAMILY'
  | 'ADVENTURE'
  | 'CRUISE'
  | 'WEEKEND';

export type TravelStyle =
  | 'LUXURY'
  | 'BUDGET'
  | 'BEACH'
  | 'MOUNTAIN'
  | 'ADVENTURE'
  | 'CULTURAL'
  | 'WILDLIFE'
  | 'WELLNESS'
  | 'FAMILY'
  | 'CITY_BREAK';

export type BookingType = 'PACKAGE' | 'HOTEL';
export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
/** Payment state as tracked on a booking. */
export type BookingPaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';
/** Payment state as tracked by the payment service transaction. */
export type PaymentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED';

/**
 * How a booking is paid.
 * - `RAZORPAY` — online, UPI / BHIM via Razorpay.
 * - `CASH` — pay in cash at the hotel on arrival (hotel bookings only).
 */
export type PaymentMethod = 'RAZORPAY' | 'CASH';

export type ReviewTargetType = 'DESTINATION' | 'PACKAGE' | 'HOTEL';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type WishlistItemType = 'DESTINATION' | 'PACKAGE' | 'HOTEL';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'PAYMENT_RECEIVED'
  | 'REFUND_PROCESSED'
  | 'TRIP_REMINDER'
  | 'REVIEW_APPROVED'
  | 'PROMOTION'
  | 'SYSTEM';

export type ActivityCategory =
  | 'SIGHTSEEING'
  | 'FOOD'
  | 'TRANSPORT'
  | 'ACCOMMODATION'
  | 'ACTIVITY'
  | 'SHOPPING'
  | 'FREE_TIME';

// -------------------------------------------------------------------- auth

export interface UserSummary {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  roles: RoleName[];
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: UserSummary;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ------------------------------------------------------------- destinations

export interface DestinationSummary {
  id: number;
  name: string;
  slug: string;
  country: string;
  city: string | null;
  continent: string;
  shortDescription: string;
  heroImageUrl: string;
  thumbnailUrl: string | null;
  rating: number;
  reviewCount: number;
  averageBudget: number | null;
  currency: string;
  tags: string[];
  featured: boolean;
}

export interface DestinationImage {
  id: number;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
}

export interface Attraction {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  distanceKm: number | null;
}

export interface TravelGuide {
  id: number;
  category: string;
  title: string;
  content: string;
}

export interface DestinationDetail extends Omit<DestinationSummary, 'thumbnailUrl'> {
  region: string | null;
  description: string;
  bestTimeToVisit: string | null;
  latitude: number | null;
  longitude: number | null;
  gallery: DestinationImage[];
  attractions: Attraction[];
  guides: TravelGuide[];
}

export interface DestinationFacets {
  countries: string[];
  continents: string[];
  tags: string[];
}

export interface DestinationQuery {
  search?: string;
  country?: string;
  continent?: string;
  tag?: string;
  minRating?: number;
  featured?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

// ----------------------------------------------------------------- packages

export interface PackageSummary {
  id: number;
  title: string;
  slug: string;
  destinationName: string;
  destinationSlug: string;
  destinationCountry: string;
  summary: string;
  durationDays: number;
  durationNights: number;
  price: number;
  discountPrice: number | null;
  effectivePrice: number;
  discountPercent: number | null;
  currency: string;
  packageType: PackageType;
  travelStyle: TravelStyle;
  rating: number;
  reviewCount: number;
  heroImageUrl: string;
  featured: boolean;
  trending: boolean;
}

export interface PackageItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
  meals: string | null;
  accommodation: string | null;
}

export interface PackageAvailability {
  id: number;
  departureDate: string;
  seatsTotal: number;
  seatsBooked: number;
  seatsAvailable: number;
  price: number;
}

export interface PackageDetail extends PackageSummary {
  description: string;
  maxGroupSize: number | null;
  gallery: string[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: PackageItineraryDay[];
  availability: PackageAvailability[];
}

export interface PackageFilterOptions {
  minPrice: number;
  maxPrice: number;
  packageTypes: string[];
  travelStyles: string[];
  totalPackages: number;
}

export interface PackageQuery {
  search?: string;
  destination?: string;
  packageType?: PackageType;
  travelStyle?: TravelStyle;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  minRating?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

// -------------------------------------------------------------------- hotels

export interface HotelSummary {
  id: number;
  name: string;
  slug: string;
  destinationName: string;
  destinationSlug: string;
  city: string;
  country: string;
  shortDescription: string;
  starRating: number;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  currency: string;
  heroImageUrl: string;
  amenities: string[];
  featured: boolean;
}

export interface HotelRoom {
  id: number;
  roomType: string;
  description: string | null;
  pricePerNight: number;
  capacity: number;
  bedType: string | null;
  sizeSqm: number | null;
  roomsAvailable: number;
  imageUrl: string | null;
}

export interface HotelDetail extends HotelSummary {
  address: string;
  description: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  latitude: number | null;
  longitude: number | null;
  gallery: string[];
  rooms: HotelRoom[];
}

export interface HotelFilterOptions {
  minPrice: number;
  maxPrice: number;
  amenities: string[];
}

export interface HotelQuery {
  search?: string;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  starRating?: number;
  minRating?: number;
  amenity?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

// ------------------------------------------------------------------ bookings

export interface TravellerRequest {
  fullName: string;
  age: number;
  gender: string;
  passportNumber?: string;
  nationality?: string;
  leadTraveller: boolean;
}

export interface TravellerResponse extends TravellerRequest {
  id: number;
}

export interface BookingItem {
  label: string;
  unitPrice: number;
  quantity: number;
  amount: number;
}

export interface CreateBookingRequest {
  bookingType: BookingType;
  itemSlug: string;
  roomId?: number | null;
  startDate: string;
  endDate: string;
  travellerCount: number;
  roomCount?: number | null;
  travellers: TravellerRequest[];
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
}

export interface BookingSummary {
  id: number;
  bookingReference: string;
  bookingType: BookingType;
  itemSlug: string;
  itemTitle: string;
  itemImageUrl: string | null;
  destinationName: string | null;
  startDate: string;
  endDate: string;
  travellerCount: number;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: BookingPaymentStatus;
  createdAt: string;
}

export interface BookingDetail extends BookingSummary {
  userId: number;
  userEmail: string;
  roomType: string | null;
  nights: number;
  roomCount: number | null;
  paymentReference: string | null;
  contactEmail: string;
  contactPhone: string;
  specialRequests: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  refundAmount: number | null;
  travellers: TravellerResponse[];
  items: BookingItem[];
}

export interface Invoice {
  invoiceNumber: string;
  bookingReference: string;
  issuedAt: string;
  customerName: string;
  customerEmail: string;
  itemTitle: string;
  startDate: string;
  endDate: string;
  travellerCount: number;
  lineItems: BookingItem[];
  subtotal: number;
  taxes: number;
  total: number;
  currency: string;
  paymentStatus: BookingPaymentStatus;
}

export interface TrendPoint {
  period: string;
  bookings: number;
  revenue: number;
}

export interface TopItem {
  title: string;
  bookings: number;
  revenue: number;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  bookingsLast30Days: number;
  totalRevenue: number;
  monthlyTrend: TrendPoint[];
  topSelling: TopItem[];
}

// ------------------------------------------------------------------ payments

export interface InitiatePaymentResponse {
  paymentReference: string;
  bookingReference: string;
  provider: string;
  providerOrderId: string;
  amount: number;
  currency: string;
  publicKey: string;
  checkoutUrl: string | null;
  status: PaymentStatus;
}

export interface VerifyPaymentRequest {
  paymentReference: string;
  providerPaymentId: string;
  signature: string;
}

export interface Payment {
  id: number;
  paymentReference: string;
  bookingReference: string;
  amount: number;
  currency: string;
  provider: string;
  providerOrderId: string;
  providerPaymentId: string | null;
  status: PaymentStatus;
  method: string | null;
  failureReason: string | null;
  paidAt: string | null;
  refundedAmount: number | null;
  createdAt: string;
}

export interface Refund {
  id: number;
  paymentReference: string;
  amount: number;
  providerRefundId: string;
  status: string;
  reason: string | null;
  createdAt: string;
}

export interface RevenuePoint {
  period: string;
  revenue: number;
  transactions: number;
}

export interface RevenueStats {
  grossRevenue: number;
  refunded: number;
  netRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  monthlyRevenue: RevenuePoint[];
}

// ------------------------------------------------------------------ wishlist

export interface WishlistItem {
  id: number;
  itemType: WishlistItemType;
  itemSlug: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
  savedAt: string;
}

export interface SaveWishlistItemRequest {
  itemType: WishlistItemType;
  itemSlug: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  currency?: string | null;
}

export interface WishlistToggleResponse {
  saved: boolean;
  item: WishlistItem | null;
  totalSaved: number;
}

export interface WishlistSlugs {
  destinations: string[];
  packages: string[];
  hotels: string[];
}

// ------------------------------------------------------------------- reviews

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatarUrl: string | null;
  targetType: ReviewTargetType;
  targetSlug: string;
  rating: number;
  title: string | null;
  comment: string;
  status: ReviewStatus;
  helpfulCount: number;
  verified: boolean;
  createdAt: string;
}

export interface CreateReviewRequest {
  targetType: ReviewTargetType;
  targetSlug: string;
  bookingReference?: string;
  rating: number;
  title?: string;
  comment: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>;
}

export interface ModerationStats {
  pending: number;
  approved: number;
  rejected: number;
}

// -------------------------------------------------------------- notifications

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

// --------------------------------------------------------------- itineraries

export interface ItineraryActivity {
  id: number;
  startTime: string | null;
  title: string;
  description: string | null;
  location: string | null;
  category: ActivityCategory;
  completed: boolean;
}

export interface ItineraryDay {
  id: number;
  dayNumber: number;
  date: string | null;
  title: string;
  description: string | null;
  activities: ItineraryActivity[];
}

export interface ItinerarySummary {
  id: number;
  bookingReference: string | null;
  title: string;
  destinationName: string | null;
  coverImageUrl: string | null;
  startDate: string;
  endDate: string;
  durationDays: number;
  dayCount: number;
}

export interface ItineraryDetail extends Omit<ItinerarySummary, 'dayCount'> {
  notes: string | null;
  days: ItineraryDay[];
}

export interface SaveItineraryRequest {
  bookingReference?: string | null;
  title: string;
  destinationName?: string | null;
  coverImageUrl?: string | null;
  startDate: string;
  endDate: string;
  notes?: string | null;
}

// ---------------------------------------------------------------- user/profile

export interface UserProfile {
  id: number;
  userId: number;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  nationality: string | null;
  bio: string | null;
  preferredCurrency: string;
  marketingOptIn: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  nationality?: string | null;
  bio?: string | null;
  preferredCurrency?: string;
  marketingOptIn: boolean;
}

export interface Address {
  id: number;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  country: string;
  postalCode: string;
  defaultAddress: boolean;
}

export type AddressRequest = Omit<Address, 'id'>;

export interface AdminUser {
  id: number;
  userId: number;
  email: string;
  fullName: string;
  phone: string | null;
  nationality: string | null;
  joinedAt: string;
}

export interface CustomerGrowth {
  totalCustomers: number;
  newLast7Days: number;
  newLast30Days: number;
}
