import { Building2, Compass, Luggage, MapPinned, Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { useSearchDestinationsQuery } from '@/features/destinations/destinationsApi';
import { useSearchPackagesQuery } from '@/features/packages/packagesApi';
import { useSearchHotelsQuery } from '@/features/hotels/hotelsApi';
import { DestinationCard } from '@/components/cards/DestinationCard';
import { PackageCard } from '@/components/cards/PackageCard';
import { HotelCard } from '@/components/cards/HotelCard';
import { Input } from '@/components/ui/Input';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Seo } from '@/components/common/Seo';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'destinations' | 'packages' | 'hotels';

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'destinations', label: 'Destinations' },
  { id: 'packages', label: 'Packages' },
  { id: 'hotels', label: 'Hotels' },
];

/** Cross-catalogue search: one query fanned out to all three services. */
export default function SearchPage() {
  const { getString, setParams } = useQueryParams();
  const [tab, setTab] = useState<Tab>('all');
  const [draft, setDraft] = useState(getString('search'));
  const query = useDebouncedValue(draft, 400);

  const enabled = query.trim().length >= 2;
  const size = tab === 'all' ? 4 : 12;

  const { data: destinations, isLoading: destinationsLoading } = useSearchDestinationsQuery(
    { search: query, size },
    { skip: !enabled || (tab !== 'all' && tab !== 'destinations') },
  );
  const { data: packages, isLoading: packagesLoading } = useSearchPackagesQuery(
    { search: query, size },
    { skip: !enabled || (tab !== 'all' && tab !== 'packages') },
  );
  const { data: hotels, isLoading: hotelsLoading } = useSearchHotelsQuery(
    { search: query, size },
    { skip: !enabled || (tab !== 'all' && tab !== 'hotels') },
  );

  const isLoading = destinationsLoading || packagesLoading || hotelsLoading;
  const totalResults =
    (destinations?.totalElements ?? 0) +
    (packages?.totalElements ?? 0) +
    (hotels?.totalElements ?? 0);

  const showDestinations = tab === 'all' || tab === 'destinations';
  const showPackages = tab === 'all' || tab === 'packages';
  const showHotels = tab === 'all' || tab === 'hotels';

  return (
    <>
      <Seo
        title="Search"
        description="Search GoTour destinations, tour packages and hotels in one place."
      />

      <div className="shell section-tight">
        <h1 className="text-3xl sm:text-4xl">Search GoTour</h1>
        <p className="text-muted mt-2 text-sm sm:text-base">
          Destinations, tour packages and hotels — all in one place.
        </p>

        <div className="mt-6 max-w-2xl">
          <Input
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setParams({ search: event.target.value || undefined });
            }}
            placeholder="Try “Bali”, “honeymoon” or “beach resort”"
            leftIcon={<SearchIcon className="size-4" />}
            aria-label="Search GoTour"
            className="h-13 text-base"
            autoFocus
          />
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="tablist">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
                tab === item.id
                  ? 'bg-linear-to-b from-brand-600 to-brand-800 text-white shadow-[0_1px_0_0_oklch(1_0_0/0.2)_inset,0_8px_18px_-8px_oklch(0.352_0.062_197/0.7)] dark:from-brand-300 dark:to-brand-500 dark:text-brand-950'
                  : 'surface-card hover:bg-[var(--surface-muted)]',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-10">
          {!enabled ? (
            <EmptyState
              icon={SearchIcon}
              title="Start typing to search"
              description="Enter at least two characters to search across destinations, packages and hotels."
            />
          ) : isLoading ? (
            <CardGridSkeleton count={8} />
          ) : totalResults === 0 ? (
            <EmptyState
              icon={Compass}
              title={`Nothing matched “${query}”`}
              description="Try a shorter search term, a country name, or browse the full catalogue."
            />
          ) : (
            <div className="space-y-14">
              {showDestinations && destinations && destinations.content.length > 0 && (
                <section>
                  <SectionHeading
                    eyebrow={`${destinations.totalElements} found`}
                    title="Destinations"
                    href={tab === 'all' ? `/destinations?search=${encodeURIComponent(query)}` : undefined}
                  />
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {destinations.content.map((item) => (
                      <DestinationCard key={item.slug} item={item} className="h-full" />
                    ))}
                  </div>
                </section>
              )}

              {showPackages && packages && packages.content.length > 0 && (
                <section>
                  <SectionHeading
                    eyebrow={`${packages.totalElements} found`}
                    title="Tour packages"
                    href={tab === 'all' ? `/packages?search=${encodeURIComponent(query)}` : undefined}
                  />
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {packages.content.map((item) => (
                      <PackageCard key={item.slug} item={item} className="h-full" />
                    ))}
                  </div>
                </section>
              )}

              {showHotels && hotels && hotels.content.length > 0 && (
                <section>
                  <SectionHeading
                    eyebrow={`${hotels.totalElements} found`}
                    title="Hotels"
                    href={tab === 'all' ? `/hotels?search=${encodeURIComponent(query)}` : undefined}
                  />
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {hotels.content.map((item) => (
                      <HotelCard key={item.slug} item={item} className="h-full" />
                    ))}
                  </div>
                </section>
              )}

              {/* Per-tab empty states when a filtered tab has nothing. */}
              {tab === 'destinations' && destinations?.content.length === 0 && (
                <EmptyState icon={MapPinned} title="No destinations matched" />
              )}
              {tab === 'packages' && packages?.content.length === 0 && (
                <EmptyState icon={Luggage} title="No packages matched" />
              )}
              {tab === 'hotels' && hotels?.content.length === 0 && (
                <EmptyState icon={Building2} title="No hotels matched" />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
