import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

const SIZE_CLASS = { sm: 'size-3.5', md: 'size-4', lg: 'size-5' } as const;
const TEXT_CLASS = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' } as const;

/** Read-only star rating with fractional fill. */
export function Rating({
  value,
  max = 5,
  size = 'md',
  showValue = true,
  reviewCount,
  className,
}: RatingProps) {
  const safeValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), max) : 0;

  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      role="img"
      aria-label={`Rated ${safeValue.toFixed(1)} out of ${max}${
        reviewCount ? ` from ${reviewCount} reviews` : ''
      }`}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, index) => {
          const fill = Math.min(Math.max(safeValue - index, 0), 1);
          return (
            <span key={index} className="relative inline-flex" aria-hidden>
              <Star className={cn(SIZE_CLASS[size], 'text-[var(--border-subtle)]')} />
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star className={cn(SIZE_CLASS[size], 'star-fill')} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className={cn('nums-tabular font-semibold', TEXT_CLASS[size])}>
          {safeValue.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={cn('text-faint nums-tabular', TEXT_CLASS[size])}>({reviewCount})</span>
      )}
    </div>
  );
}

export interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label?: string;
  error?: string;
}

/** Interactive star picker — keyboard accessible via radio semantics. */
export function RatingInput({ value, onChange, max = 5, label, error }: RatingInputProps) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div>
      {label && <span className="mb-1.5 block text-sm font-medium">{label}</span>}
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label ?? 'Rating'}>
        {Array.from({ length: max }, (_, index) => {
          const starValue = index + 1;
          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={value === starValue}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
              className="rounded p-0.5 transition-transform hover:scale-110"
              onMouseEnter={() => setHovered(starValue)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => onChange(starValue)}
            >
              <Star
                className={cn(
                  'size-7 transition-colors',
                  starValue <= active ? 'star-fill' : 'text-[var(--border-subtle)]',
                )}
              />
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
