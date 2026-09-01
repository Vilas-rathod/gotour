import { Building2, Search } from 'lucide-react';
import { useState } from 'react';
import { useHotelFiltersQuery, useSearchHotelsQuery } from '@/features/hotels/hotelsApi';
import { HotelCard } from '@/components/cards/HotelCard';
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
import type { HotelQuery } from '@/types/api';

const SORT_OPTIONS: SortOption[] = [
  { value: 'rating', label: 'Highest rated', direction: 'desc' },
  { value: 'pricePerNight-asc', label: 'Price: low to high', direction: 'asc' },
  { value: 'pricePerNight-desc', label: 'Price: high to low', direction: 'desc' },
  { value: 'starRating', label: 'Star rating', direction: 'desc' },
];

const STAR_OPTIONS = [
  { value: '5', label: '5 star' },
  { value: '4', label: '4 star' },
  { value: '3', label: '3 star' },
];

const RATING_OPTIONS = [
  { value: '4.5', label: '4.5+' },
  { value: '4', label: '4.0+' },
  { value: '3.5', label: '3.5+' },
];

export default function HotelsPage() {
  const { getString, getNumber, setParams, clearParams, activeFilterCount } = useQueryParams();
  const { data: filterOptions } = useHotelFiltersQuery();

  const [searchDraft, setSearchDraft] = useState(getString('search'));
  const debouncedSearch = useDebouncedValue(searchDraft, 400);

  const sortValue = getString('sort', 'rating');
  const sortOption = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];

  const query: HotelQuery = {
    search: debouncedSearch || undefined,
    destination: getString('destination') || undefined,
    minPrice: getNumber('minPrice'),
    maxPrice: getNumber('maxPrice'),
    starRating: getNumber('starRating'),
    minRating: getNumber('minRating'),
    amenity: getString('amenity') || undefined,
    page: getNumber('page') ?? 0,
    size: 12,
    sortBy: sortOption.value.split('-')[0],
    direction: sortOption.direction,
  };

  const { data, isLoading, isFetching, isError, refetch } = useSearchHotelsQuery(query);

  const filters = (
    <div>
      <FilterGroup title="Search">
        <Input
          value={searchDraft}
          onChange={(event) => {
            setSearchDraft(event.target.value);
            setParams({ search: event.target.value || undefined });
          }}
          placeholder="Hotel or city"
          leftIcon={<Search className="size-4" />}
          aria-label="Search hotels"
        />
      </FilterGroup>

      <FilterGroup title="Star rating">
        <FilterChips
          options={STAR_OPTIONS}
          value={getString('starRating') || undefined}
          onChange={(value) => setParams({ starRating: value })}
        />
      </FilterGroup>

      {filterOptions && filterOptions.maxPrice > filterOptions.minPrice && (
        <FilterGroup title="Price per night">
          <PriceRangeFilter
            min={Math.floor(filterOptions.minPrice)}
            max={Math.ceil(filterOptions.maxPrice)}
            valueMin={getNumber('minPrice')}
            valueMax={getNumber('maxPrice')}
            onChange={(next) => setParams(next)}
          />
        </FilterGroup>
      )}

      <FilterGroup title="Amenities">
        <FilterChips
          options={(filterOptions?.amenities ?? []).map((value) => ({ value, label: value }))}
          value={getString('amenity') || undefined}
          onChange={(value) => setParams({ amenity: value })}
          visibleCount={8}
        />
      </FilterGroup>

      <FilterGroup title="Guest rating">
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
        title="Hotels & resorts"
        description="Compare verified GoTour hotels and resorts by price, star rating and amenities. Free cancellation on selected rooms."
      />

      <PageHeader
        eyebrow="Stays"
        title="Rooms worth staying in"
        description="Every property is inspected by our team. Compare rooms, amenities and real guest ratings."
        imageUrl="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=70"
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
              icon={Building2}
              title="We could not load hotels"
              description="Something went wrong reaching the catalogue. Please try again."
              action={<Button onClick={() => refetch()}>Retry</Button>}
            />
          ) : data && data.content.length > 0 ? (
            <>
              <div className={isFetching ? 'space-y-5 opacity-60 transition-opacity' : 'space-y-5'}>
                {data.content.map((item, index) => (
                  <HotelCard key={item.slug} item={item} layout="horizontal" priority={index < 3} />
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
              icon={Building2}
              title="No hotels match those filters"
              description="Try raising your price ceiling or removing an amenity filter."
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
