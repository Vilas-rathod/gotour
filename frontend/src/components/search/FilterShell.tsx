import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format';

export interface SortOption {
  value: string;
  label: string;
  direction: 'asc' | 'desc';
}

export interface FilterShellProps {
  filters: ReactNode;
  children: ReactNode;
  totalResults?: number;
  activeFilterCount: number;
  onClearFilters: () => void;
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (option: SortOption) => void;
}

/**
 * Two-column results layout: a sticky filter rail from `lg` up, and a
 * bottom-sheet filter drawer on smaller screens.
 */
export function FilterShell({
  filters,
  children,
  totalResults,
  activeFilterCount,
  onClearFilters,
  sortOptions,
  sortValue,
  onSortChange,
}: FilterShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const sortSelect = (
    <Select
      value={sortValue}
      onChange={(event) => {
        const option = sortOptions.find((item) => item.value === event.target.value);
        if (option) onSortChange(option);
      }}
      aria-label="Sort results"
      className="h-10 w-auto min-w-44 text-sm"
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      {/* ------------------------------------------- desktop filter rail */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Filters</h2>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onClearFilters}
                className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-400"
              >
                Clear all
              </button>
            )}
          </div>
          {filters}
        </div>
      </aside>

      <div className="min-w-0">
        {/* -------------------------------------------- results toolbar */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-muted text-sm">
            {totalResults === undefined ? (
              <span className="inline-block h-4 w-28 animate-pulse rounded bg-[var(--surface-muted)]" />
            ) : (
              <>
                <span className="font-semibold text-[var(--text-strong)]">
                  {formatNumber(totalResults)}
                </span>{' '}
                {totalResults === 1 ? 'result' : 'results'}
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">{sortSelect}</div>

            <Button
              variant="secondary"
              size="sm"
              className="lg:hidden"
              onClick={() => setDrawerOpen(true)}
              leftIcon={<SlidersHorizontal className="size-4" />}
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-0.5 grid size-5 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="mb-4 sm:hidden">{sortSelect}</div>

        {children}
      </div>

      {/* ------------------------------------------- mobile filter sheet */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-100 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filter results"
              className={cn(
                'surface-card absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl shadow-lift',
              )}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="font-display text-lg font-semibold">Filters</h2>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close filters"
                  className="text-muted rounded-full p-2 transition-colors hover:bg-[var(--surface-muted)]"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">{filters}</div>

              <div className="grid grid-cols-2 gap-3 border-t p-4 pb-safe">
                <Button
                  variant="secondary"
                  onClick={() => {
                    onClearFilters();
                    setDrawerOpen(false);
                  }}
                >
                  Clear all
                </Button>
                <Button onClick={() => setDrawerOpen(false)}>Show results</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------- primitives

export function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-b py-4 first:pt-0 last:border-0">
      <legend className="mb-3 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

export interface FilterChipsProps {
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  /** Chips beyond this count collapse behind a "show more" toggle. */
  visibleCount?: number;
}

export function FilterChips({ options, value, onChange, visibleCount }: FilterChipsProps) {
  const [expanded, setExpanded] = useState(false);
  const limit = visibleCount ?? options.length;
  const visible = expanded ? options : options.slice(0, limit);

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? undefined : option.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              selected
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'hover:border-brand-400 hover:bg-[var(--surface-muted)]',
            )}
          >
            {option.label}
          </button>
        );
      })}

      {options.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400"
        >
          {expanded ? 'Show less' : `+${options.length - limit} more`}
        </button>
      )}
    </div>
  );
}

export interface PriceRangeFilterProps {
  min: number;
  max: number;
  valueMin: number | undefined;
  valueMax: number | undefined;
  currency?: string;
  onChange: (next: { minPrice?: number; maxPrice?: number }) => void;
}

export function PriceRangeFilter({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: PriceRangeFilterProps) {
  const [draft, setDraft] = useState(valueMax ?? max);

  // Keep the slider in step with external resets (e.g. "clear all").
  useEffect(() => {
    setDraft(valueMax ?? max);
  }, [valueMax, max]);

  return (
    <div>
      <input
        type="range"
        min={min}
        max={max}
        step={Math.max(1, Math.round((max - min) / 100))}
        value={draft}
        onChange={(event) => setDraft(Number(event.target.value))}
        onMouseUp={() => onChange({ minPrice: valueMin, maxPrice: draft })}
        onTouchEnd={() => onChange({ minPrice: valueMin, maxPrice: draft })}
        onKeyUp={() => onChange({ minPrice: valueMin, maxPrice: draft })}
        aria-label="Maximum price"
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--border-subtle)] accent-brand-600"
      />
      <div className="text-muted mt-2.5 flex items-center justify-between text-xs">
        <span>{formatNumber(min)}</span>
        <span className="font-semibold text-[var(--text-strong)]">up to {formatNumber(draft)}</span>
        <span>{formatNumber(max)}</span>
      </div>
    </div>
  );
}
