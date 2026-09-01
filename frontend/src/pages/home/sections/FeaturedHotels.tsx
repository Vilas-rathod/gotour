import { useFeaturedHotelsQuery } from '@/features/hotels/hotelsApi';
import { HotelCard } from '@/components/cards/HotelCard';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Carousel } from '@/components/common/Carousel';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Reveal } from '@/components/common/Reveal';

export function FeaturedHotels() {
  const { data, isLoading, isError } = useFeaturedHotelsQuery();

  if (isError || (!isLoading && !data?.length)) return null;

  return (
    <section className="section bg-[var(--surface-sunken)]">
      <div className="shell">
        <Reveal>
          <SectionHeading
            eyebrow="Where to stay"
            title="Handpicked hotels & resorts"
            description="Every property is visited and rated by our team before it reaches this list."
            href="/hotels"
            linkLabel="Browse all hotels"
          />
        </Reveal>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <Carousel
            ariaLabel="Featured hotels"
            items={data ?? []}
            getKey={(item) => item.slug}
            renderItem={(item) => <HotelCard item={item} className="h-full" />}
          />
        )}
      </div>
    </section>
  );
}
