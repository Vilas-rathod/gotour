import { usePopularDestinationsQuery } from '@/features/destinations/destinationsApi';
import { DestinationCard } from '@/components/cards/DestinationCard';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Carousel } from '@/components/common/Carousel';
import { Skeleton } from '@/components/ui/Skeleton';
import { Reveal } from '@/components/common/Reveal';

export function PopularDestinations() {
  const { data, isLoading, isError } = usePopularDestinationsQuery();

  // A failing marketing section should never break the page — hide it instead.
  if (isError || (!isLoading && !data?.length)) return null;

  return (
    <section className="shell section">
      <Reveal>
        <SectionHeading
          eyebrow="Trending now"
          title="Destinations travellers love"
          description="The places our community is booking most this season — each one vetted by the GoTour team."
          href="/destinations"
          linkLabel="Explore all destinations"
        />
      </Reveal>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="aspect-[3/4] rounded-3xl" />
          ))}
        </div>
      ) : (
        <Carousel
          ariaLabel="Popular destinations"
          items={data ?? []}
          getKey={(item) => item.slug}
          perView={{ base: 1.3, sm: 2.3, md: 3, lg: 4 }}
          renderItem={(item, index) => (
            <DestinationCard item={item} variant="tall" priority={index < 4} />
          )}
        />
      )}
    </section>
  );
}
