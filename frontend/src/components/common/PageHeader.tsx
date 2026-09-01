import { motion } from 'framer-motion';
import { SmartImage } from '@/components/common/SmartImage';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** When set, the header renders as an image banner instead of plain type. */
  imageUrl?: string;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  imageUrl,
  className,
}: PageHeaderProps) {
  if (!imageUrl) {
    return (
      <header className={cn('shell pt-12 lg:pt-16', className)}>
        {eyebrow && (
          <span className="flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] text-brand-ink-soft uppercase">
            <span className="h-px w-7 bg-linear-to-r from-gold-500/0 to-gold-500" aria-hidden />
            {eyebrow}
          </span>
        )}
        <h1 className="text-display-md mt-3">{title}</h1>
        {description && (
          <p className="text-muted mt-4 max-w-2xl text-base leading-relaxed">{description}</p>
        )}
        <hr className="rule-gold mt-8" />
      </header>
    );
  }

  return (
    // Pulled up under the fixed navbar (cancelling `main`'s padding) so the
    // banner is full-bleed; the extra top padding keeps the copy clear of it.
    <header className={cn('relative isolate -mt-16 overflow-hidden lg:-mt-18', className)}>
      <SmartImage src={imageUrl} alt="" wrapperClassName="absolute inset-0 -z-10" priority />
      <div className="hero-scrim absolute inset-0 -z-10" />

      {/* Hands off to the page background so the banner does not end on a
          hard horizon line. */}
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-[var(--surface)] to-transparent"
        aria-hidden
      />

      <div className="shell pt-28 pb-16 lg:pt-36 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl text-white"
        >
          {eyebrow && (
            <span className="glass-on-media inline-block rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase">
              {eyebrow}
            </span>
          )}
          <h1 className="text-display-lg mt-5 text-white [text-shadow:0_2px_24px_oklch(0_0_0/0.35)]">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-base leading-relaxed text-white/85">{description}</p>
          )}
        </motion.div>
      </div>
    </header>
  );
}
