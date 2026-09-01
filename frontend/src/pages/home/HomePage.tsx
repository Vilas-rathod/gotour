import { Seo } from '@/components/common/Seo';
import { HeroSection } from './sections/HeroSection';
import { PopularDestinations } from './sections/PopularDestinations';
import { TrendingPackages } from './sections/TrendingPackages';
import { FeaturedTours } from './sections/FeaturedTours';
import { LuxuryCollection } from './sections/LuxuryCollection';
import { FeaturedHotels } from './sections/FeaturedHotels';
import { WhyGoTour } from './sections/WhyGoTour';
import { TravelStories } from './sections/TravelStories';
import { Testimonials } from './sections/Testimonials';
import { PartnerBrands } from './sections/PartnerBrands';
import { CallToAction } from './sections/CallToAction';

const HOME_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'GoTour',
  description:
    'GoTour is a premium travel booking platform for curated tour packages, luxury hotels and unforgettable destinations.',
  url: 'https://gotour.example.com',
  areaServed: 'Worldwide',
  priceRange: '₹₹',
};

export default function HomePage() {
  return (
    <>
      <Seo
        title="GoTour — Extraordinary Journeys, Effortlessly Booked"
        description="Discover handpicked destinations, curated tour packages and luxury hotels. Compare, plan and book your next trip with GoTour in minutes."
        jsonLd={HOME_JSON_LD}
      />

      <HeroSection />
      <PopularDestinations />
      <TrendingPackages />
      <WhyGoTour />
      <FeaturedTours />
      <LuxuryCollection />
      <FeaturedHotels />
      <TravelStories />
      <Testimonials />
      <PartnerBrands />
      <CallToAction />
    </>
  );
}
