import { CalendarHeart, Compass, Landmark, MapPin, Wallet } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useDestinationBySlugQuery,
  useRelatedDestinationsQuery,
} from '@/features/destinations/destinationsApi';
import { useSearchPackagesQuery } from '@/features/packages/packagesApi';
import { useSearchHotelsQuery } from '@/features/hotels/hotelsApi';
import { DestinationCard } from '@/components/cards/DestinationCard';
import { PackageCard } from '@/components/cards/PackageCard';
import { HotelCard } from '@/components/cards/HotelCard';
import { WishlistHeart } from '@/components/cards/WishlistHeart';
import { ReviewSection } from '@/components/reviews/ReviewSection';
import { Gallery } from '@/components/common/Gallery';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { BackLink } from '@/components/common/BackLink';
import { AccordionItem } from '@/components/common/Accordion';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Seo } from '@/components/common/Seo';
import { SmartImage } from '@/components/common/SmartImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Rating } from '@/components/ui/Rating';
import { DetailSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/format';

export default function DestinationDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();

  const { data: destination, isLoading, isError } = useDestinationBySlugQuery(slug, { skip: !slug });
  const { data: related } = useRelatedDestinationsQuery(slug, { skip: !slug });
  const { data: packages } = useSearchPackagesQuery(
    { destination: slug, size: 4, sortBy: 'popularity', direction: 'desc' },
    { skip: !slug },
  );
  const { data: hotels } = useSearchHotelsQuery(
    { destination: slug, size: 4, sortBy: 'rating', direction: 'desc' },
    { skip: !slug },
  );

  if (isLoading) {
    return (
      <div className="shell section-tight">
        <DetailSkeleton />
      </div>
    );
  }

  if (isError || !destination) {
    return (
      <div className="shell section">
        <EmptyState
          icon={Compass}
          title="Destination not found"
          description="This destination may have been removed or the link is incorrect."
          action={<Button onClick={() => navigate('/destinations')}>Browse destinations</Button>}
        />
      </div>
    );
  }

  const galleryImages = destination.gallery.length
    ? destination.gallery.map((image) => image.imageUrl)
    : [destination.heroImageUrl];

  const hasMapCoords = destination.latitude !== null && destination.longitude !== null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: destination.name,
    description: destination.shortDescription,
    image: destination.heroImageUrl,
    address: {
      '@type': 'PostalAddress',
      addressCountry: destination.country,
      addressLocality: destination.city ?? undefined,
    },
    geo: hasMapCoords
      ? {
          '@type': 'GeoCoordinates',
          latitude: destination.latitude,
          longitude: destination.longitude,
        }
      : undefined,
  };

  return (
    <>
      <Seo
        title={`${destination.name}, ${destination.country}`}
        description={destination.shortDescription}
        image={destination.heroImageUrl}
        jsonLd={jsonLd}
      />

      <div className="shell py-6 lg:py-10">
        <BackLink fallbackTo="/destinations" label="Back to destinations" className="mb-3" />

        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Destinations', to: '/destinations' },
            { label: destination.continent, to: `/destinations?continent=${destination.continent}` },
            { label: destination.name },
          ]}
        />

        <div className="mt-5">
          <Gallery images={galleryImages} alt={destination.name} />
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-muted flex items-center gap-1.5 text-sm">
                  <MapPin className="size-4" aria-hidden />
                  {destination.city ? `${destination.city}, ` : ''}
                  {destination.country} · {destination.continent}
                </p>
                <h1 className="mt-2 text-3xl lg:text-4xl">{destination.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Rating value={destination.rating} reviewCount={destination.reviewCount} />
                  {destination.featured && <Badge variant="accent">Featured</Badge>}
                </div>
              </div>

              <WishlistHeart
                variant="plain"
                className="size-11 shrink-0 border"
                item={{
                  itemType: 'DESTINATION',
                  itemSlug: destination.slug,
                  title: destination.name,
                  subtitle: destination.country,
                  imageUrl: destination.heroImageUrl,
                  price: destination.averageBudget,
                  currency: destination.currency,
                }}
              />
            </div>

            {destination.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {destination.tags.map((tag) => (
                  <Badge key={tag} variant="brand">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <section className="mt-8">
              <h2 className="text-2xl">About {destination.name}</h2>
              <p className="text-muted mt-3 leading-relaxed whitespace-pre-line">
                {destination.description}
              </p>
            </section>

            {destination.attractions.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl">Nearby attractions</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {destination.attractions.map((attraction) => (
                    <Card key={attraction.id} className="overflow-hidden">
                      {attraction.imageUrl && (
                        <SmartImage
                          src={attraction.imageUrl}
                          alt={attraction.name}
                          wrapperClassName="aspect-[16/9]"
                        />
                      )}
                      <CardBody>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display font-semibold">{attraction.name}</h3>
                          {attraction.distanceKm !== null && (
                            <Badge variant="neutral" size="sm">
                              {attraction.distanceKm} km
                            </Badge>
                          )}
                        </div>
                        {attraction.category && (
                          <p className="text-muted mt-1 text-xs font-medium">
                            {attraction.category}
                          </p>
                        )}
                        {attraction.description && (
                          <p className="text-muted mt-2 text-sm leading-relaxed">
                            {attraction.description}
                          </p>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {destination.guides.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl">Travel guide</h2>
                <div className="mt-4 space-y-3">
                  {destination.guides.map((guide, index) => (
                    <AccordionItem
                      key={guide.id}
                      id={`guide-${guide.id}`}
                      defaultOpen={index === 0}
                      header={
                        <span>
                          <span className="text-muted block text-[11px] font-semibold tracking-wider uppercase">
                            {guide.category}
                          </span>
                          <span className="block font-semibold">{guide.title}</span>
                        </span>
                      }
                    >
                      <p className="text-muted text-sm leading-relaxed whitespace-pre-line">
                        {guide.content}
                      </p>
                    </AccordionItem>
                  ))}
                </div>
              </section>
            )}

            {/* ------------------------------------------------------ map */}
            {hasMapCoords && (
              <section className="mt-10">
                <h2 className="text-2xl">On the map</h2>
                <div className="surface-card mt-4 overflow-hidden rounded-2xl">
                  {/*
                    Embedded OpenStreetMap keeps this dependency-free and key-free.
                    Swap for Google Maps / Mapbox by replacing this iframe.
                  */}
                  <iframe
                    title={`Map of ${destination.name}`}
                    loading="lazy"
                    className="h-80 w-full border-0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                      Number(destination.longitude) - 0.12
                    }%2C${Number(destination.latitude) - 0.08}%2C${
                      Number(destination.longitude) + 0.12
                    }%2C${Number(destination.latitude) + 0.08}&layer=mapnik&marker=${
                      destination.latitude
                    }%2C${destination.longitude}`}
                  />
                </div>
              </section>
            )}

            <div className="mt-12">
              <ReviewSection
                targetType="DESTINATION"
                targetSlug={destination.slug}
                targetTitle={destination.name}
              />
            </div>
          </div>

          {/* ------------------------------------------------- info rail */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <Card>
              <CardBody className="space-y-4">
                <h2 className="font-display text-lg font-semibold">Plan your visit</h2>

                {destination.bestTimeToVisit && (
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
                      <CalendarHeart className="size-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                        Best time to visit
                      </p>
                      <p className="text-sm font-medium">{destination.bestTimeToVisit}</p>
                    </div>
                  </div>
                )}

                {destination.averageBudget !== null && (
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
                      <Wallet className="size-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                        Typical budget
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency(destination.averageBudget, destination.currency)} per person
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
                    <Landmark className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                      Attractions listed
                    </p>
                    <p className="text-sm font-medium">{destination.attractions.length} places</p>
                  </div>
                </div>

                <div className="space-y-2.5 border-t pt-4">
                  <Button
                    fullWidth
                    onClick={() => navigate(`/packages?destination=${destination.slug}`)}
                  >
                    View tour packages
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => navigate(`/hotels?destination=${destination.slug}`)}
                  >
                    Find hotels here
                  </Button>
                </div>
              </CardBody>
            </Card>
          </aside>
        </div>

        {packages && packages.content.length > 0 && (
          <section className="mt-16">
            <SectionHeading
              eyebrow="Ready-made trips"
              title={`Packages to ${destination.name}`}
              href={`/packages?destination=${destination.slug}`}
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {packages.content.map((item) => (
                <PackageCard key={item.slug} item={item} className="h-full" />
              ))}
            </div>
          </section>
        )}

        {hotels && hotels.content.length > 0 && (
          <section className="mt-16">
            <SectionHeading
              eyebrow="Where to stay"
              title={`Top hotels in ${destination.name}`}
              href={`/hotels?destination=${destination.slug}`}
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {hotels.content.map((item) => (
                <HotelCard key={item.slug} item={item} className="h-full" />
              ))}
            </div>
          </section>
        )}

        {related && related.length > 0 && (
          <section className="mt-16">
            <SectionHeading eyebrow="Keep exploring" title="Related destinations" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.slice(0, 4).map((item) => (
                <DestinationCard key={item.slug} item={item} className="h-full" />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
