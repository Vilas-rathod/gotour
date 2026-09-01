import { BedDouble, Building2, Check, Clock, MapPin, Maximize, ShieldCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useHotelBySlugQuery } from '@/features/hotels/hotelsApi';
import { WishlistHeart } from '@/components/cards/WishlistHeart';
import { ReviewSection } from '@/components/reviews/ReviewSection';
import { Gallery } from '@/components/common/Gallery';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { BackLink } from '@/components/common/BackLink';
import { Seo } from '@/components/common/Seo';
import { SmartImage } from '@/components/common/SmartImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Rating } from '@/components/ui/Rating';
import { DetailSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, nightsBetween, toIsoDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function HotelDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { data: hotel, isLoading, isError } = useHotelBySlugQuery(slug, { skip: !slug });

  const today = toIsoDate(new Date());
  const tomorrow = toIsoDate(new Date(Date.now() + 86_400_000));

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [roomCount, setRoomCount] = useState(1);
  const [guests, setGuests] = useState(2);

  const nights = useMemo(() => Math.max(1, nightsBetween(checkIn, checkOut)), [checkIn, checkOut]);

  if (isLoading) {
    return (
      <div className="shell section-tight">
        <DetailSkeleton />
      </div>
    );
  }

  if (isError || !hotel) {
    return (
      <div className="shell section">
        <EmptyState
          icon={Building2}
          title="Hotel not found"
          description="This property may have been removed or the link is incorrect."
          action={<Button onClick={() => navigate('/hotels')}>Browse hotels</Button>}
        />
      </div>
    );
  }

  const galleryImages = hotel.gallery?.length ? hotel.gallery : [hotel.heroImageUrl];
  const selectedRoom = hotel.rooms.find((room) => room.id === roomId) ?? null;
  const nightlyRate = selectedRoom?.pricePerNight ?? hotel.pricePerNight;
  const total = nightlyRate * nights * roomCount;

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/hotels/${slug}` } });
      return;
    }
    if (!selectedRoom) return;

    navigate(`/checkout/hotel/${slug}`, {
      state: {
        roomId: selectedRoom.id,
        roomType: selectedRoom.roomType,
        startDate: checkIn,
        endDate: checkOut,
        roomCount,
        travellers: guests,
        unitPrice: nightlyRate,
        nights,
      },
    });
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    description: hotel.shortDescription,
    image: hotel.heroImageUrl,
    starRating: { '@type': 'Rating', ratingValue: hotel.starRating },
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotel.address,
      addressLocality: hotel.city,
      addressCountry: hotel.country,
    },
    priceRange: formatCurrency(hotel.pricePerNight, hotel.currency),
  };

  return (
    <>
      <Seo
        title={`${hotel.name}, ${hotel.city}`}
        description={hotel.shortDescription}
        image={hotel.heroImageUrl}
        jsonLd={jsonLd}
      />

      <div className="shell py-6 lg:py-10">
        <BackLink fallbackTo="/hotels" label="Back to hotels" className="mb-3" />

        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Hotels', to: '/hotels' },
            { label: hotel.destinationName, to: `/destinations/${hotel.destinationSlug}` },
            { label: hotel.name },
          ]}
        />

        <div className="mt-5">
          <Gallery images={galleryImages} alt={hotel.name} />
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex" aria-label={`${hotel.starRating} star hotel`}>
                    {Array.from({ length: hotel.starRating }, (_, index) => (
                      <span key={index} className="text-[var(--star)]" aria-hidden>
                        ★
                      </span>
                    ))}
                  </span>
                  {hotel.featured && <Badge variant="accent">Featured</Badge>}
                </div>

                <h1 className="mt-2 text-3xl lg:text-4xl">{hotel.name}</h1>

                <Link
                  to={`/destinations/${hotel.destinationSlug}`}
                  className="text-muted mt-2 inline-flex items-center gap-1.5 text-sm hover:text-brand-ink"
                >
                  <MapPin className="size-4" aria-hidden />
                  {hotel.address}, {hotel.city}, {hotel.country}
                </Link>

                <div className="mt-3">
                  <Rating value={hotel.rating} reviewCount={hotel.reviewCount} />
                </div>
              </div>

              <WishlistHeart
                variant="plain"
                className="size-11 shrink-0 border"
                item={{
                  itemType: 'HOTEL',
                  itemSlug: hotel.slug,
                  title: hotel.name,
                  subtitle: `${hotel.city}, ${hotel.country}`,
                  imageUrl: hotel.heroImageUrl,
                  price: hotel.pricePerNight,
                  currency: hotel.currency,
                }}
              />
            </div>

            <section className="mt-8">
              <h2 className="text-2xl">About this property</h2>
              <p className="text-muted mt-3 leading-relaxed whitespace-pre-line">
                {hotel.description}
              </p>

              {(hotel.checkInTime || hotel.checkOutTime) && (
                <div className="text-muted mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {hotel.checkInTime && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-4" aria-hidden />
                      Check-in from {hotel.checkInTime}
                    </span>
                  )}
                  {hotel.checkOutTime && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-4" aria-hidden />
                      Check-out by {hotel.checkOutTime}
                    </span>
                  )}
                </div>
              )}
            </section>

            {hotel.amenities.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl">Amenities</h2>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {hotel.amenities.map((amenity) => (
                    <li key={amenity} className="flex items-center gap-2.5 text-sm">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                        <Check className="size-3" aria-hidden />
                      </span>
                      {amenity}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ------------------------------------------------------ rooms */}
            <section id="rooms" className="mt-10 scroll-mt-24">
              <h2 className="text-2xl">Choose your room</h2>

              {hotel.rooms.length === 0 ? (
                <p className="text-muted mt-4 rounded-xl border border-dashed p-4 text-sm">
                  No room types are published for this property yet.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {hotel.rooms.map((room) => {
                    const soldOut = room.roomsAvailable <= 0;
                    const isSelected = room.id === roomId;

                    return (
                      <Card
                        key={room.id}
                        className={cn(
                          'overflow-hidden transition-all',
                          isSelected && 'ring-2 ring-brand-500',
                          soldOut && 'opacity-60',
                        )}
                      >
                        <div className="grid sm:grid-cols-[220px_1fr]">
                          <SmartImage
                            src={room.imageUrl ?? hotel.heroImageUrl}
                            alt={room.roomType}
                            wrapperClassName="aspect-[4/3] sm:h-full sm:aspect-auto"
                          />

                          <CardBody className="flex flex-col">
                            <h3 className="font-display text-lg font-semibold">{room.roomType}</h3>
                            {room.description && (
                              <p className="text-muted mt-1.5 text-sm">{room.description}</p>
                            )}

                            <div className="text-muted mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                              <span className="inline-flex items-center gap-1.5">
                                <Users className="size-3.5" aria-hidden />
                                Sleeps {room.capacity}
                              </span>
                              {room.bedType && (
                                <span className="inline-flex items-center gap-1.5">
                                  <BedDouble className="size-3.5" aria-hidden />
                                  {room.bedType}
                                </span>
                              )}
                              {room.sizeSqm && (
                                <span className="inline-flex items-center gap-1.5">
                                  <Maximize className="size-3.5" aria-hidden />
                                  {room.sizeSqm} m²
                                </span>
                              )}
                            </div>

                            <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                              <div>
                                <span className="font-display text-xl font-bold text-brand-ink">
                                  {formatCurrency(room.pricePerNight, hotel.currency)}
                                </span>
                                <span className="text-muted block text-[11px]">
                                  per night ·{' '}
                                  {soldOut
                                    ? 'Sold out'
                                    : `${room.roomsAvailable} left`}
                                </span>
                              </div>

                              <Button
                                variant={isSelected ? 'primary' : 'outline'}
                                size="sm"
                                disabled={soldOut}
                                onClick={() => {
                                  setRoomId(room.id);
                                  setGuests(Math.min(guests, room.capacity));
                                  document
                                    .getElementById('booking-rail')
                                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                              >
                                {isSelected ? 'Selected' : 'Select room'}
                              </Button>
                            </div>
                          </CardBody>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="mt-12">
              <ReviewSection targetType="HOTEL" targetSlug={hotel.slug} targetTitle={hotel.name} />
            </div>
          </div>

          {/* ----------------------------------------------- booking rail */}
          <aside id="booking-rail" className="scroll-mt-24 lg:sticky lg:top-24 lg:h-fit">
            <Card>
              <CardBody>
                <div>
                  <span className="font-display text-3xl font-bold text-brand-ink">
                    {formatCurrency(nightlyRate, hotel.currency)}
                  </span>
                  <span className="text-muted block text-xs">per night</span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-muted mb-1.5 block text-[11px] font-bold tracking-wider uppercase">
                      Check in
                    </span>
                    <input
                      type="date"
                      value={checkIn}
                      min={today}
                      onChange={(event) => {
                        setCheckIn(event.target.value);
                        if (event.target.value >= checkOut) {
                          setCheckOut(
                            toIsoDate(new Date(new Date(event.target.value).getTime() + 86_400_000)),
                          );
                        }
                      }}
                      className="h-11 w-full rounded-xl border bg-transparent px-3 text-sm outline-none focus:border-brand-500"
                    />
                  </label>

                  <label className="block">
                    <span className="text-muted mb-1.5 block text-[11px] font-bold tracking-wider uppercase">
                      Check out
                    </span>
                    <input
                      type="date"
                      value={checkOut}
                      min={toIsoDate(new Date(new Date(checkIn).getTime() + 86_400_000))}
                      onChange={(event) => setCheckOut(event.target.value)}
                      className="h-11 w-full rounded-xl border bg-transparent px-3 text-sm outline-none focus:border-brand-500"
                    />
                  </label>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-muted mb-1.5 block text-[11px] font-bold tracking-wider uppercase">
                      Rooms
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={selectedRoom?.roomsAvailable ?? 10}
                      value={roomCount}
                      onChange={(event) => setRoomCount(Math.max(1, Number(event.target.value) || 1))}
                      className="h-11 w-full rounded-xl border bg-transparent px-3 text-sm outline-none focus:border-brand-500"
                    />
                  </label>

                  <label className="block">
                    <span className="text-muted mb-1.5 block text-[11px] font-bold tracking-wider uppercase">
                      Guests
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={(selectedRoom?.capacity ?? 4) * roomCount}
                      value={guests}
                      onChange={(event) => setGuests(Math.max(1, Number(event.target.value) || 1))}
                      className="h-11 w-full rounded-xl border bg-transparent px-3 text-sm outline-none focus:border-brand-500"
                    />
                  </label>
                </div>

                {!selectedRoom && (
                  <p className="text-muted mt-4 rounded-xl border border-dashed p-3 text-xs">
                    Pick a room type above to see your total.
                  </p>
                )}

                <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">
                      {formatCurrency(nightlyRate, hotel.currency)} × {nights}{' '}
                      {nights === 1 ? 'night' : 'nights'}
                      {roomCount > 1 ? ` × ${roomCount} rooms` : ''}
                    </dt>
                    <dd className="font-medium">{formatCurrency(total, hotel.currency)}</dd>
                  </div>
                  <div className="text-muted flex justify-between">
                    <dt>Taxes & fees</dt>
                    <dd>Included</dd>
                  </div>
                  <div className="flex justify-between border-t pt-2.5 text-base font-bold">
                    <dt>Total</dt>
                    <dd className="text-brand-ink">
                      {formatCurrency(total, hotel.currency)}
                    </dd>
                  </div>
                </dl>

                <Button
                  size="lg"
                  fullWidth
                  className="mt-5"
                  disabled={!selectedRoom}
                  onClick={handleBook}
                >
                  {selectedRoom ? 'Continue to booking' : 'Select a room'}
                </Button>

                <p className="text-muted mt-3 flex items-center justify-center gap-1.5 text-xs">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  Secure checkout · No card details stored
                </p>
              </CardBody>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
