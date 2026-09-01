import { useFeaturedPackagesQuery } from '@/features/packages/packagesApi';
import { PackageCard } from '@/components/cards/PackageCard';
import { SectionHeading } from '@/components/common/SectionHeading';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Reveal, RevealGroup, revealItem } from '@/components/common/Reveal';
import { motion } from 'framer-motion';

export function FeaturedTours() {
  const { data, isLoading, isError } = useFeaturedPackagesQuery();

  if (isError || (!isLoading && !data?.length)) return null;

  return (
    <section className="shell section">
      <Reveal>
        <SectionHeading
          eyebrow="Editor's picks"
          title="Featured tours this month"
          description="Small-group departures our travel designers are recommending right now."
          href="/packages?sortBy=rating"
          linkLabel="See all featured"
        />
      </Reveal>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(data ?? []).slice(0, 8).map((item) => (
            <motion.div key={item.slug} variants={revealItem}>
              <PackageCard item={item} className="h-full" />
            </motion.div>
          ))}
        </RevealGroup>
      )}
    </section>
  );
}
