import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Logo({ className, onLight = false }: { className?: string; onLight?: boolean }) {
  return (
    <Link
      to="/"
      className={cn('group inline-flex items-center gap-2.5', className)}
      aria-label="GoTour home"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-brand-800 ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
        <svg viewBox="0 0 64 64" className="size-5" aria-hidden>
          <path d="M44 20 L28 44 L24 33 L14 29 Z" fill="white" opacity="0.95" />
          <circle cx="41" cy="23" r="3" className="fill-brand-800" />
        </svg>
      </span>
      <span
        className={cn(
          'font-display text-xl font-bold tracking-tight',
          onLight ? 'text-white' : 'text-[var(--text-strong)]',
        )}
      >
        Go
        {/* On the hero the wordmark sits on a dark image, so it needs the light
            step; elsewhere it needs the dark one. */}
        <span className={onLight ? 'text-gold-300' : 'text-brand-ink'}>Tour</span>
      </span>
    </Link>
  );
}
