import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = 'View all',
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between lg:mb-12',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
        {eyebrow && (
          // The eyebrow is set as a small-caps rule rather than plain text: a
          // short gold hairline anchors it and reads as a mark of section
          // rather than as another line of copy.
          <span
            className={cn(
              'mb-3 flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] text-brand-ink-soft uppercase',
              align === 'center' && 'justify-center',
            )}
          >
            <span className="h-px w-7 bg-linear-to-r from-gold-500/0 to-gold-500" aria-hidden />
            {eyebrow}
            <span
              className={cn(
                'h-px w-7 bg-linear-to-l from-gold-500/0 to-gold-500',
                align === 'center' ? 'inline-block' : 'hidden',
              )}
              aria-hidden
            />
          </span>
        )}
        <h2 className="text-display-md">{title}</h2>
        {description && (
          <p className="text-muted mt-3.5 text-base leading-relaxed text-pretty">{description}</p>
        )}
      </div>

      {href && (
        <Link
          to={href}
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-2 text-sm font-semibold text-brand-ink transition-all hover:border-gold-500/60 hover:elev-2"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      )}
    </div>
  );
}
