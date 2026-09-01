import { Luggage, Search } from 'lucide-react';
import { useState } from 'react';
import { useSearchPackagesQuery, usePackageFiltersQuery } from '@/features/packages/packagesApi';
import { PackageCard } from '@/components/cards/PackageCard';
import {
  FilterChips,
  FilterGroup,
  FilterShell,
  PriceRangeFilter,
  type SortOption,
} from '@/components/search/FilterShell';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Seo } from '@/components/common/Seo';
import { PageHeader } from '@/components/common/PageHeader';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { humanizeEnum } from '@/lib/format';
import type { PackageQuery, PackageType, TravelStyle } from '@/types/api';

const SORT_OPTIONS: SortOption[] = [
  { value: 'popularity', label: 'Most popular', direction: 'desc' },
  { value: 'price-asc', label: 'Price: low to high', direction: 'asc' },
  { value: 'price-desc', label: 'Price: high to low', direction: 'desc' },
  { value: 'rating', label: 'Highest rated', direction: 'desc' },
  { value: 'createdAt', label: 'Newest first', direction: 'desc' },
];

const DURATION_OPTIONS = [
  { value: '1-3', label: '1–3 days' },
  { value: '4-6', label: '4–6 days' },
  { value: '7-10', label: '7–10 days' },
  { value: '11-', label: '11+ days' },
];

const RATING_OPTIONS = [
  { value: '4.5', label: '4.5+' },
  { value: '4', label: '4.0+' },
  { value: '3.5', label: '3.5+' },
];

export default function PackagesPage() {
  const { getString, getNumber, setParams, clearParams, activeFilterCount } = useQueryParams();
  const { data: filterOptions } = usePackageFiltersQuery();

  const [searchDraft, setSearchDraft] = useState(getString('search'));
  const debouncedSearch = useDebouncedValue(searchDraft, 400);

  const sortValue = getString('sort', 'popularity');
  const sortOption = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];

  const minDuration = getNumber('minDuration');
  const maxDuration = getNumber('maxDuration');
  const durationValue =
    minDuration !== undefined || maxDuration !== undefined
      ? `${minDuration ?? ''}-${maxDuration ?? ''}`
      : undefined;

  const query: PackageQuery = {
    search: debouncedSearch || undefined,
    destination: getString('destination') || undefined,
    packageType: (getString('packageType') || undefined) as PackageType | undefined,
    travelStyle: (getString('travelStyle') || undefined) as TravelStyle | undefined,
    minPrice: getNumber('minPrice'),
    maxPrice: getNumber('maxPrice'),
    minDuration,
    maxDuration,
    minRating: getNumber('minRating'),
    page: getNumber('page') ?? 0,
    size: 12,
    // The composite "price-asc" style values map onto the backend's field + direction.
    sortBy: sortOption.value.startsWith('price') ? 'price' : sortOption.value,
    direction: sortOption.direction,
  };

  const { data, isLoading, isFetching, isError, refetch } = useSearchPackagesQuery(query);

  const filters = (
    <div>
      <FilterGroup title="Search">
        <Input
          value={searchDraft}
          onChange={(event) => {
            setSearchDraft(event.target.value);
            setParams({ search: event.target.value || undefined });
          }}
          placeholder="Trip name or destination"
          leftIcon={<Search className="size-4" />}
          aria-label="Search packages"
        />
      </FilterGroup>

      <FilterGroup title="Package type">
        <FilterChips
          options={(filterOptions?.packageTypes ?? []).map((type) => ({
            value: type,
            label: humanizeEnum(type),
          }))}
          value={getString('packageType') || undefined}
          onChange={(value) => setParams({ packageType: value })}
          visibleCount={5}
        />
      </FilterGroup>

      <FilterGroup title="Travel style">
        <FilterChips
          options={(filterOptions?.travelStyles ?? []).map((style) => ({
            value: style,
            label: humanizeEnum(style),
          }))}
          value={getString('travelStyle') || undefined}
          onChange={(value) => setParams({ travelStyle: value })}
          visibleCount={5}
        />
      </FilterGroup>

      {filterOptions && filterOptions.maxPrice > filterOptions.minPrice && (
        <FilterGroup title="Price per person">
          <PriceRangeFilter
            min={Math.floor(filterOptions.minPrice)}
            max={Math.ceil(filterOptions.maxPrice)}
            valueMin={getNumber('minPrice')}
            valueMax={getNumber('maxPrice')}
            onChange={(next) => setParams(next)}
          />
        </FilterGroup>
      )}

      <FilterGroup title="Duration">
        <FilterChips
          options={DURATION_OPTIONS}
          value={durationValue}
          onChange={(value) => {
            if (!value) {
              setParams({ minDuration: undefined, maxDuration: undefined });
              return;
            }
            const [from, to] = value.split('-');
            setParams({ minDuration: from || undefined, maxDuration: to || undefined });
          }}
        />
      </FilterGroup>

      <FilterGroup title="Traveller rating">
        <FilterChips
          options={RATING_OPTIONS}
          value={getString('minRating') || undefined}
          onChange={(value) => setParams({ minRating: value })}
        />
      </FilterGroup>
    </div>
  );

  return (
    <>
      <Seo
        title="Tour packages"
        description="Browse curated GoTour packages by destination, budget, duration and travel style. Transparent per-person pricing with no hidden fees."
      />

      <PageHeader
        eyebrow="Tour packages"
        title="Find a trip built around how you travel"
        description="Every package includes stays, transfers and guided experiences. Filter by budget, pace and style."
        imageUrl="https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1800&q=70"
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
          onSortChange={(option) => setParams({ sort: option.value })}
        >
          {isLoading ? (
            <CardGridSkeleton count={9} />
          ) : isError ? (
            <EmptyState
              icon={Luggage}
              title="We could not load packages"
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
                  <PackageCard key={item.slug} item={item} priority={index < 3} className="h-full" />
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
              icon={Luggage}
              title="No packages match those filters"
              description="Try widening your budget or clearing a filter or two."
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
