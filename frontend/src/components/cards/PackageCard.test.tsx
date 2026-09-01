import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { PackageCard } from './PackageCard';
import { renderWithProviders } from '@/test/testUtils';
import type { PackageSummary } from '@/types/api';

const BASE: PackageSummary = {
  id: 1,
  title: 'Bali Honeymoon Escape',
  slug: 'bali-honeymoon-escape',
  destinationName: 'Bali',
  destinationSlug: 'bali',
  destinationCountry: 'Indonesia',
  summary: 'Private villas, sunset dinners and a day on Nusa Penida.',
  durationDays: 7,
  durationNights: 6,
  price: 120000,
  discountPrice: 96000,
  effectivePrice: 96000,
  discountPercent: 20,
  currency: 'INR',
  packageType: 'HONEYMOON',
  travelStyle: 'LUXURY',
  rating: 4.7,
  reviewCount: 132,
  heroImageUrl: 'https://example.com/bali.jpg',
  featured: true,
  trending: true,
};

describe('PackageCard', () => {
  it('links to the package detail page by slug', () => {
    renderWithProviders(<PackageCard item={BASE} />);

    expect(screen.getByRole('link', { name: /Bali Honeymoon Escape/i })).toHaveAttribute(
      'href',
      '/packages/bali-honeymoon-escape',
    );
  });

  it('shows the discounted price alongside the struck-through original', () => {
    renderWithProviders(<PackageCard item={BASE} />);

    expect(screen.getByText(/96,000/)).toBeInTheDocument();
    expect(screen.getByText(/1,20,000/)).toBeInTheDocument();
    expect(screen.getByText('20% off')).toBeInTheDocument();
  });

  it('omits the discount badge when there is no discount', () => {
    renderWithProviders(
      <PackageCard item={{ ...BASE, discountPrice: null, discountPercent: null, effectivePrice: 120000 }} />,
    );

    expect(screen.queryByText(/% off/)).not.toBeInTheDocument();
  });

  it('does not treat a discount equal to the list price as a discount', () => {
    renderWithProviders(
      <PackageCard item={{ ...BASE, discountPrice: 120000, effectivePrice: 120000, discountPercent: 0 }} />,
    );

    expect(screen.queryByText(/% off/)).not.toBeInTheDocument();
  });

  it('exposes the rating to assistive technology', () => {
    renderWithProviders(<PackageCard item={BASE} />);

    expect(screen.getByRole('img', { name: /Rated 4.7 out of 5/i })).toBeInTheDocument();
  });

  it('labels the wishlist button with the package title', () => {
    renderWithProviders(<PackageCard item={BASE} />);

    expect(
      screen.getByRole('button', { name: /Save Bali Honeymoon Escape to wishlist/i }),
    ).toBeInTheDocument();
  });
});
