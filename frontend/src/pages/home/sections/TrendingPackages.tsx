import { useTrendingPackagesQuery } from '@/features/packages/packagesApi';
import { PackageCard } from '@/components/cards/PackageCard';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Carousel } from '@/components/common/Carousel';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Reveal } from '@/components/common/Reveal';

export function TrendingPackages() {
  const { data, isLoading, isError } = useTrendingPackagesQuery();

  if (isError || (!isLoading && !data?.length)) return null;

  return (
    <section className="section bg-[var(--surface-sunken)]">
      <div className="shell">
        <Reveal>
          <SectionHeading
            eyebrow="Most booked"
            title="Trending tour packages"
            description="Complete trips with stays, transfers and guided experiences — priced per person, no hidden extras."
            href="/packages"
            linkLabel="Browse all packages"
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
            ariaLabel="Trending tour packages"
            items={data ?? []}
            getKey={(item) => item.slug}
            renderItem={(item) => <PackageCard item={item} className="h-full" />}
          />
        )}
      </div>
    </section>
  );
}
