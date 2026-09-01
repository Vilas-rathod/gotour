import { MapPinned, Search } from 'lucide-react';
import { useState } from 'react';
import {
  useDestinationFacetsQuery,
  useSearchDestinationsQuery,
} from '@/features/destinations/destinationsApi';
import { DestinationCard } from '@/components/cards/DestinationCard';
import {
  FilterChips,
  FilterGroup,
  FilterShell,
  type SortOption,
} from '@/components/search/FilterShell';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Input';
import { Seo } from '@/components/common/Seo';
import { PageHeader } from '@/components/common/PageHeader';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { DestinationQuery } from '@/types/api';

const SORT_OPTIONS: SortOption[] = [
  { value: 'popularityScore', label: 'Most popular', direction: 'desc' },
  { value: 'rating', label: 'Highest rated', direction: 'desc' },
  { value: 'name', label: 'Name: A to Z', direction: 'asc' },
  { value: 'averageBudget', label: 'Budget: low to high', direction: 'asc' },
];

const RATING_OPTIONS = [
  { value: '4.5', label: '4.5+' },
  { value: '4', label: '4.0+' },
  { value: '3.5', label: '3.5+' },
];

export default function DestinationsPage() {
  const { getString, getNumber, setParams, clearParams, activeFilterCount } = useQueryParams();
  const { data: facets } = useDestinationFacetsQuery();

  const [searchDraft, setSearchDraft] = useState(getString('search'));
  const debouncedSearch = useDebouncedValue(searchDraft, 400);

  const sortValue = getString('sortBy', 'popularityScore');
  const sortOption = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];

  const query: DestinationQuery = {
    search: debouncedSearch || undefined,
    country: getString('country') || undefined,
    continent: getString('continent') || undefined,
    tag: getString('tag') || undefined,
    minRating: getNumber('minRating'),
    featured: getString('featured') === 'true' ? true : undefined,
    page: getNumber('page') ?? 0,
    size: 12,
    sortBy: sortOption.value,
    direction: sortOption.direction,
  };

  const { data, isLoading, isFetching, isError, refetch } = useSearchDestinationsQuery(query);

  const filters = (
    <div>
      <FilterGroup title="Search">
        <Input
          value={searchDraft}
          onChange={(event) => {
            setSearchDraft(event.target.value);
            setParams({ search: event.target.value || undefined });
          }}
          placeholder="City or country"
          leftIcon={<Search className="size-4" />}
          aria-label="Search destinations"
        />
      </FilterGroup>

      <FilterGroup title="Continent">
        <FilterChips
          options={(facets?.continents ?? []).map((value) => ({ value, label: value }))}
          value={getString('continent') || undefined}
          onChange={(value) => setParams({ continent: value })}
          visibleCount={6}
        />
      </FilterGroup>

      <FilterGroup title="Country">
        <FilterChips
          options={(facets?.countries ?? []).map((value) => ({ value, label: value }))}
          value={getString('country') || undefined}
          onChange={(value) => setParams({ country: value })}
          visibleCount={8}
        />
      </FilterGroup>

      <FilterGroup title="Experience">
        <FilterChips
          options={(facets?.tags ?? []).map((value) => ({ value, label: value }))}
          value={getString('tag') || undefined}
          onChange={(value) => setParams({ tag: value })}
          visibleCount={10}
        />
      </FilterGroup>

      <FilterGroup title="Traveller rating">
        <FilterChips
          options={RATING_OPTIONS}
          value={getString('minRating') || undefined}
          onChange={(value) => setParams({ minRating: value })}
        />
      </FilterGroup>

      <FilterGroup title="Other">
        <Checkbox
          checked={getString('featured') === 'true'}
          onChange={(event) => setParams({ featured: event.target.checked ? 'true' : undefined })}
          label="Featured destinations only"
        />
      </FilterGroup>
    </div>
  );

  return (
    <>
      <Seo
        title="Destinations"
        description="Explore GoTour destinations across six continents — travel guides, top attractions and the best time to visit each place."
      />

      <PageHeader
        eyebrow="Destinations"
        title="Where would you like to wake up tomorrow?"
        description="Browse every destination we cover, complete with local guides, attractions and seasonal advice."
        imageUrl="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1800&q=70"
      />

      <div className="shell section-tight">
        <FilterShell
          filters={filters}
          totalResults={data?.totalElements}
          activeFilterCount={activeFilterCount}
          onClearFilters={() => {
            setSearchDraft('');
            clearParams();
          }}
          sortOptions={SORT_OPTIONS}
          sortValue={sortValue}
          onSortChange={(option) => setParams({ sortBy: option.value, direction: option.direction })}
        >
          {isLoading ? (
            <CardGridSkeleton count={9} />
          ) : isError ? (
            <EmptyState
              icon={MapPinned}
              title="We could not load destinations"
              description="Something went wrong reaching the catalogue. Please try again."
              action={<Button onClick={() => refetch()}>Retry</Button>}
            />
          ) : data && data.content.length > 0 ? (
            <>
              <div
                className={
                  isFetching
                    ? 'grid grid-cols-1 gap-5 opacity-60 transition-opacity sm:grid-cols-2 xl:grid-cols-3'
                    : 'grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 xl:grid-cols-3'
                }
              >
                {data.content.map((item, index) => (
                  <DestinationCard
                    key={item.slug}
                    item={item}
                    priority={index < 3}
                    className="h-full"
                  />
                ))}
              </div>

              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onPageChange={(page) => setParams({ page }, false)}
                className="mt-10"
              />
            </>
          ) : (
            <EmptyState
              icon={MapPinned}
              title="No destinations match those filters"
              description="Try a different continent, or clear your filters to see everything."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchDraft('');
                    clearParams();
                  }}
                >
                  Clear all filters
                </Button>
              }
            />
          )}
        </FilterShell>
      </div>
    </>
  );
}
