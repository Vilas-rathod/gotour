import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Builds a 1-based page list with ellipses: 1 … 4 5 6 … 20 */
function buildPageList(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages: (number | 'gap')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push('gap');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push('gap');
  pages.push(total);

  return pages;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const currentOneBased = page + 1;
  const pages = buildPageList(currentOneBased, totalPages);

  const buttonClass =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none';

  return (
    <nav className={cn('flex items-center justify-center gap-1.5', className)} aria-label="Pagination">
      <button
        type="button"
        className={cn(buttonClass, 'hover:bg-[var(--surface-muted)]')}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>

      {pages.map((entry, index) =>
        entry === 'gap' ? (
          <span key={`gap-${index}`} className="text-muted px-1" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            className={cn(
              buttonClass,
              entry === currentOneBased
                ? 'bg-linear-to-b from-brand-600 to-brand-800 text-white shadow-[0_1px_0_0_oklch(1_0_0/0.2)_inset,0_8px_18px_-8px_oklch(0.352_0.062_197/0.7)] dark:from-brand-300 dark:to-brand-500 dark:text-brand-950'
                : 'hover:bg-[var(--surface-muted)]',
            )}
            onClick={() => onPageChange(entry - 1)}
            aria-current={entry === currentOneBased ? 'page' : undefined}
            aria-label={`Page ${entry}`}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        className={cn(buttonClass, 'hover:bg-[var(--surface-muted)]')}
        onClick={() => onPageChange(page + 1)}
        disabled={currentOneBased >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
