import {
  CalendarDays,
  Check,
  Clock,
  Compass,
  MapPin,
  ShieldCheck,
  Users,
  X as XIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  usePackageAvailabilityQuery,
  usePackageBySlugQuery,
  useRelatedPackagesQuery,
} from '@/features/packages/packagesApi';
import { PackageCard } from '@/components/cards/PackageCard';
import { WishlistHeart } from '@/components/cards/WishlistHeart';
import { ReviewSection } from '@/components/reviews/ReviewSection';
import { Gallery } from '@/components/common/Gallery';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { BackLink } from '@/components/common/BackLink';
import { AccordionItem } from '@/components/common/Accordion';
import { Seo } from '@/components/common/Seo';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Rating } from '@/components/ui/Rating';
import { DetailSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, humanizeEnum } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function PackageDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { data: pkg, isLoading, isError } = usePackageBySlugQuery(slug, { skip: !slug });
  const { data: availability } = usePackageAvailabilityQuery(slug, { skip: !slug });
  const { data: related } = useRelatedPackagesQuery(slug, { skip: !slug });

  const [selectedDeparture, setSelectedDeparture] = useState<number | null>(null);
  const [travellers, setTravellers] = useState(2);

  if (isLoading) {
    return (
      <div className="shell section-tight">
        <DetailSkeleton />
      </div>
    );
  }

  if (isError || !pkg) {
    return (
      <div className="shell section">
        <EmptyState
          icon={Compass}
          title="Package not found"
          description="This trip may have been removed or the link is incorrect."
          action={<Button onClick={() => navigate('/packages')}>Browse all packages</Button>}
        />
      </div>
    );
  }

  const departures = availability ?? pkg.availability ?? [];
  const selected = departures.find((departure) => departure.id === selectedDeparture) ?? null;
  const unitPrice = selected?.price ?? pkg.effectivePrice;
  const total = unitPrice * travellers;
  const seatsLeft = selected?.seatsAvailable ?? null;
  const gallery = pkg.gallery?.length ? pkg.gallery : [pkg.heroImageUrl];

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/packages/${slug}` } });
      return;
    }
    if (!selected) return;

    navigate(`/checkout/package/${slug}`, {
      state: {
        departureDate: selected.departureDate,
        travellers,
        unitPrice,
      },
    });
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: pkg.title,
    description: pkg.summary,
    image: pkg.heroImageUrl,
    touristType: humanizeEnum(pkg.travelStyle),
    offers: {
      '@type': 'Offer',
      price: pkg.effectivePrice,
      priceCurrency: pkg.currency,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating:
      pkg.reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: pkg.rating,
            reviewCount: pkg.reviewCount,
          }
        : undefined,
  };

  return (
    <>
      <Seo
        title={pkg.title}
        description={pkg.summary}
        image={pkg.heroImageUrl}
        jsonLd={jsonLd}
      />

      <div className="shell py-6 lg:py-10">
        <BackLink fallbackTo="/packages" label="Back to packages" className="mb-3" />

        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Packages', to: '/packages' },
            { label: pkg.destinationName, to: `/destinations/${pkg.destinationSlug}` },
            { label: pkg.title },
          ]}
        />

        <div className="mt-5">
          <Gallery images={gallery} alt={pkg.title} />
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* -------------------------------------------------- main */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand">{humanizeEnum(pkg.packageType)}</Badge>
                  <Badge variant="neutral">{humanizeEnum(pkg.travelStyle)}</Badge>
                  {pkg.trending && <Badge variant="accent">Trending</Badge>}
                </div>

                <h1 className="mt-3 text-3xl lg:text-4xl">{pkg.title}</h1>

                <Link
                  to={`/destinations/${pkg.destinationSlug}`}
                  className="text-muted mt-2 inline-flex items-center gap-1.5 text-sm hover:text-brand-ink"
                >
                  <MapPin className="size-4" aria-hidden />
                  {pkg.destinationName}, {pkg.destinationCountry}
                </Link>

                <div className="mt-3">
                  <Rating value={pkg.rating} reviewCount={pkg.reviewCount} />
                </div>
              </div>

              <WishlistHeart
                variant="plain"
                className="size-11 shrink-0 border"
                item={{
                  itemType: 'PACKAGE',
                  itemSlug: pkg.slug,
                  title: pkg.title,
                  subtitle: `${pkg.destinationName}, ${pkg.destinationCountry}`,
                  imageUrl: pkg.heroImageUrl,
                  price: pkg.effectivePrice,
                  currency: pkg.currency,
                }}
              />
            </div>

            {/* ---------------------------------------------- quick facts */}
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Clock, label: 'Duration', value: `${pkg.durationDays}D / ${pkg.durationNights}N` },
                {
                  icon: Users,
                  label: 'Group size',
                  value: pkg.maxGroupSize ? `Up to ${pkg.maxGroupSize}` : 'Flexible',
                },
                { icon: CalendarDays, label: 'Departures', value: `${departures.length} dates` },
                { icon: ShieldCheck, label: 'Booking', value: 'Instant confirm' },
              ].map((fact) => (
                <div key={fact.label} className="surface-card rounded-2xl p-3.5">
                  <fact.icon className="size-4.5 text-brand-ink-soft" aria-hidden />
                  <dt className="text-muted mt-2 text-[11px] font-semibold tracking-wider uppercase">
                    {fact.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <section className="mt-10">
              <h2 className="text-2xl">About this trip</h2>
              <p className="text-muted mt-3 leading-relaxed whitespace-pre-line">{pkg.description}</p>
            </section>

            {pkg.highlights.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl">Trip highlights</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {pkg.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                        <Check className="size-3" aria-hidden />
                      </span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {pkg.itinerary.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl">Day-by-day itinerary</h2>
                <div className="mt-4 space-y-3">
                  {pkg.itinerary.map((day, index) => (
                    <AccordionItem
                      key={day.dayNumber}
                      id={`day-${day.dayNumber}`}
                      defaultOpen={index === 0}
                      header={
                        <span className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                            {day.dayNumber}
                          </span>
                          <span className="min-w-0">
                            <span className="text-muted block text-[11px] font-semibold tracking-wider uppercase">
                              Day {day.dayNumber}
                            </span>
                            <span className="block truncate font-semibold">{day.title}</span>
                          </span>
                        </span>
                      }
                    >
                      <p className="text-muted text-sm leading-relaxed">{day.description}</p>
                      {(day.meals || day.accommodation) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {day.meals && <Badge variant="neutral" size="sm">Meals: {day.meals}</Badge>}
                          {day.accommodation && (
                            <Badge variant="neutral" size="sm">Stay: {day.accommodation}</Badge>
                          )}
                        </div>
                      )}
                    </AccordionItem>
                  ))}
                </div>
              </section>
            )}

            {(pkg.inclusions.length > 0 || pkg.exclusions.length > 0) && (
              <section className="mt-10 grid gap-6 sm:grid-cols-2">
                {pkg.inclusions.length > 0 && (
                  <Card>
                    <CardBody>
                      <h3 className="font-display text-lg font-semibold">What's included</h3>
                      <ul className="mt-3 space-y-2.5">
                        {pkg.inclusions.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-sm">
                            <Check
                              className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                              aria-hidden
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                )}

                {pkg.exclusions.length > 0 && (
                  <Card>
                    <CardBody>
                      <h3 className="font-display text-lg font-semibold">Not included</h3>
                      <ul className="mt-3 space-y-2.5">
                        {pkg.exclusions.map((item) => (
                          <li key={item} className="text-muted flex items-start gap-2.5 text-sm">
                            <XIcon className="mt-0.5 size-4 shrink-0 text-rose-500" aria-hidden />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                )}
              </section>
            )}

            <div className="mt-12">
              <ReviewSection targetType="PACKAGE" targetSlug={pkg.slug} targetTitle={pkg.title} />
            </div>
          </div>

          {/* ----------------------------------------------- booking rail */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <Card className="overflow-hidden">
              <CardBody>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    {pkg.discountPrice !== null && pkg.discountPrice < pkg.price && (
                      <span className="text-muted block text-sm line-through">
                        {formatCurrency(pkg.price, pkg.currency)}
                      </span>
                    )}
                    <span className="font-display text-3xl font-bold text-brand-ink">
                      {formatCurrency(unitPrice, pkg.currency)}
                    </span>
                    <span className="text-muted block text-xs">per person</span>
                  </div>
                  {pkg.discountPercent ? (
                    <Badge variant="success">{pkg.discountPercent}% off</Badge>
                  ) : null}
                </div>

                {/* --------------------------------------- departures */}
                <div className="mt-5">
                  <p className="mb-2.5 text-sm font-semibold">Select a departure</p>

                  {departures.length === 0 ? (
                    <p className="text-muted rounded-xl border border-dashed p-3 text-sm">
                      No dates are open right now. Check back soon or contact us for a private
                      departure.
                    </p>
                  ) : (
                    <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                      {departures.map((departure) => {
                        const soldOut = departure.seatsAvailable <= 0;
                        const isSelected = departure.id === selectedDeparture;

                        return (
                          <button
                            key={departure.id}
                            type="button"
                            disabled={soldOut}
                            onClick={() => setSelectedDeparture(departure.id)}
                            className={cn(
                              'flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all',
                              isSelected
                                ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40'
                                : 'hover:border-brand-400',
                              soldOut && 'cursor-not-allowed opacity-50',
                            )}
                          >
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold">
                                {formatDate(departure.departureDate)}
                              </span>
                              <span className="text-muted block text-xs">
                                {soldOut
                                  ? 'Sold out'
                                  : `${departure.seatsAvailable} seat${
                                      departure.seatsAvailable === 1 ? '' : 's'
                                    } left`}
                              </span>
                            </span>
                            <span className="shrink-0 text-sm font-bold text-brand-ink">
                              {formatCurrency(departure.price, pkg.currency)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* --------------------------------------- travellers */}
                <div className="mt-5">
                  <label htmlFor="travellers" className="mb-2 block text-sm font-semibold">
                    Travellers
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTravellers((count) => Math.max(1, count - 1))}
                      aria-label="Decrease travellers"
                      className="grid size-10 shrink-0 place-items-center rounded-full border text-lg font-semibold transition-colors hover:bg-[var(--surface-muted)]"
                    >
                      −
                    </button>
                    <input
                      id="travellers"
                      type="number"
                      min={1}
                      max={seatsLeft ?? pkg.maxGroupSize ?? 20}
                      value={travellers}
                      onChange={(event) =>
                        setTravellers(Math.max(1, Number(event.target.value) || 1))
                      }
                      className="h-10 w-full rounded-xl border bg-transparent text-center text-sm font-semibold outline-none focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setTravellers((count) =>
                          Math.min(seatsLeft ?? pkg.maxGroupSize ?? 20, count + 1),
                        )
                      }
                      aria-label="Increase travellers"
                      className="grid size-10 shrink-0 place-items-center rounded-full border text-lg font-semibold transition-colors hover:bg-[var(--surface-muted)]"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* ------------------------------------------ summary */}
                <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">
                      {formatCurrency(unitPrice, pkg.currency)} × {travellers}
                    </dt>
                    <dd className="font-medium">{formatCurrency(total, pkg.currency)}</dd>
                  </div>
                  <div className="text-muted flex justify-between">
                    <dt>Taxes & fees</dt>
                    <dd>Included</dd>
                  </div>
                  <div className="flex justify-between border-t pt-2.5 text-base font-bold">
                    <dt>Total</dt>
                    <dd className="text-brand-ink">
                      {formatCurrency(total, pkg.currency)}
                    </dd>
                  </div>
                </dl>

                <Button
                  size="lg"
                  fullWidth
                  className="mt-5"
                  disabled={!selected}
                  onClick={handleBook}
                >
                  {selected ? 'Continue to booking' : 'Select a departure'}
                </Button>

                <p className="text-muted mt-3 flex items-center justify-center gap-1.5 text-xs">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  Free cancellation up to 15 days before departure
                </p>
              </CardBody>
            </Card>
          </aside>
        </div>

        {related && related.length > 0 && (
          <section className="mt-16">
            <SectionHeading
              eyebrow="You may also like"
              title="Similar trips"
              href={`/packages?destination=${pkg.destinationSlug}`}
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.slice(0, 4).map((item) => (
                <PackageCard key={item.slug} item={item} className="h-full" />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
