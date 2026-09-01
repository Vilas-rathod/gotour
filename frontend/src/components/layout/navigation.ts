import {
  Building2,
  Compass,
  Heart,
  Home,
  LayoutDashboard,
  Luggage,
  MapPinned,
  Mountain,
  Palmtree,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MegaMenuLink {
  label: string;
  to: string;
  description: string;
  icon: LucideIcon;
}

export interface MegaMenuSection {
  label: string;
  to: string;
  columns: { heading: string; links: MegaMenuLink[] }[];
  /** Promo panel shown on the right of the mega menu. */
  feature?: { title: string; description: string; to: string; imageUrl: string };
}

export const MEGA_MENU: MegaMenuSection[] = [
  {
    label: 'Destinations',
    to: '/destinations',
    columns: [
      {
        heading: 'Explore by region',
        links: [
          {
            label: 'All destinations',
            to: '/destinations',
            description: 'Browse every place we cover',
            icon: MapPinned,
          },
          {
            label: 'Asia',
            to: '/destinations?continent=Asia',
            description: 'Temples, street food and islands',
            icon: Compass,
          },
          {
            label: 'Europe',
            to: '/destinations?continent=Europe',
            description: 'Old towns and alpine air',
            icon: Building2,
          },
          {
            label: 'Africa',
            to: '/destinations?continent=Africa',
            description: 'Safari plains and desert dunes',
            icon: Mountain,
          },
        ],
      },
      {
        heading: 'Travel styles',
        links: [
          {
            label: 'Beach escapes',
            to: '/destinations?tag=beach',
            description: 'Sand, reefs and slow mornings',
            icon: Palmtree,
          },
          {
            label: 'Mountain retreats',
            to: '/destinations?tag=mountain',
            description: 'High passes and quiet trails',
            icon: Mountain,
          },
          {
            label: 'Cultural capitals',
            to: '/destinations?tag=culture',
            description: 'Museums, food and history',
            icon: Sparkles,
          },
        ],
      },
    ],
    feature: {
      title: 'Luxury collection',
      description: 'Hand-picked stays and private guides in the world’s most beautiful places.',
      to: '/packages?travelStyle=LUXURY',
      imageUrl:
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=70',
    },
  },
  {
    label: 'Packages',
    to: '/packages',
    columns: [
      {
        heading: 'Popular trips',
        links: [
          {
            label: 'All packages',
            to: '/packages',
            description: 'Every curated itinerary',
            icon: Luggage,
          },
          {
            label: 'Honeymoon',
            to: '/packages?packageType=HONEYMOON',
            description: 'Private, romantic and unhurried',
            icon: Heart,
          },
          {
            label: 'Family trips',
            to: '/packages?packageType=FAMILY',
            description: 'Paced for every age group',
            icon: Users,
          },
          {
            label: 'Adventure',
            to: '/packages?packageType=ADVENTURE',
            description: 'Trek, dive, climb and raft',
            icon: Mountain,
          },
        ],
      },
      {
        heading: 'By budget',
        links: [
          {
            label: 'Weekend getaways',
            to: '/packages?maxDuration=3',
            description: 'Three days or fewer',
            icon: Ticket,
          },
          {
            label: 'Luxury journeys',
            to: '/packages?travelStyle=LUXURY',
            description: 'Five-star throughout',
            icon: Sparkles,
          },
          {
            label: 'Value picks',
            to: '/packages?travelStyle=BUDGET',
            description: 'Great trips, gentle prices',
            icon: Compass,
          },
        ],
      },
    ],
  },
  {
    label: 'Hotels',
    to: '/hotels',
    columns: [
      {
        heading: 'Find a stay',
        links: [
          {
            label: 'All hotels',
            to: '/hotels',
            description: 'Search every property',
            icon: Building2,
          },
          {
            label: 'Five star',
            to: '/hotels?starRating=5',
            description: 'The very best rooms',
            icon: Sparkles,
          },
          {
            label: 'Beachfront',
            to: '/hotels?amenity=Beachfront',
            description: 'Steps from the water',
            icon: Palmtree,
          },
        ],
      },
    ],
  },
];

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

/** Bottom tab bar on mobile — the five highest-traffic destinations. */
export const MOBILE_TABS: NavItem[] = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Explore', to: '/destinations', icon: Compass },
  { label: 'Packages', to: '/packages', icon: Luggage },
  { label: 'Saved', to: '/account/wishlist', icon: Heart },
  { label: 'Trips', to: '/account/bookings', icon: Ticket },
];

export const ACCOUNT_NAV: NavItem[] = [
  { label: 'My bookings', to: '/account/bookings', icon: Ticket },
  { label: 'Wishlist', to: '/account/wishlist', icon: Heart },
  { label: 'Itineraries', to: '/account/itineraries', icon: MapPinned },
  { label: 'My reviews', to: '/account/reviews', icon: Sparkles },
  { label: 'Profile', to: '/account/profile', icon: Users },
];

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Destinations', to: '/admin/destinations', icon: MapPinned },
  { label: 'Packages', to: '/admin/packages', icon: Luggage },
  { label: 'Hotels', to: '/admin/hotels', icon: Building2 },
  { label: 'Bookings', to: '/admin/bookings', icon: Ticket },
  { label: 'Payments', to: '/admin/payments', icon: Sparkles },
  { label: 'Reviews', to: '/admin/reviews', icon: Heart },
  { label: 'Customers', to: '/admin/customers', icon: Users },
];
