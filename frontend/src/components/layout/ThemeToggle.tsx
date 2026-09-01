import { Moon, Sun } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { themeSet } from '@/features/ui/uiSlice';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
] as const;

/**
 * A two-stop track rather than a single cycling icon.
 *
 * The icon-button version showed only the *current* mode, which reads as a
 * status indicator, not a control — people could not tell it was clickable, or
 * which way it would go. Showing both stops with a thumb on the active one
 * makes the choice, and the fact that a choice exists, legible at a glance.
 *
 * `onLight` is for the transparent navbar over a hero photo, where the ordinary
 * surface tokens would leave the track invisible.
 */
export function ThemeToggle({ className, onLight = false }: { className?: string; onLight?: boolean }) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        'relative inline-flex items-center rounded-full p-0.5',
        onLight
          ? 'border border-white/25 bg-black/25 backdrop-blur-md'
          : 'border border-[var(--border-subtle)] bg-[var(--surface-muted)]',
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${label} theme`}
            onClick={() => dispatch(themeSet(value))}
            className="relative grid size-8 place-items-center rounded-full"
          >
            {active && (
              <motion.span
                layoutId="theme-thumb"
                transition={
                  reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }
                }
                className={cn(
                  'absolute inset-0 rounded-full',
                  onLight ? 'bg-white/90' : 'bg-[var(--surface-raised)] elev-2',
                )}
                aria-hidden
              />
            )}
            <Icon
              className={cn(
                'relative size-4 transition-colors',
                active
                  ? onLight
                    ? 'text-brand-800'
                    : 'text-gold-600 dark:text-gold-400'
                  : onLight
                    ? 'text-white/65'
                    : 'text-[var(--text-faint)]',
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
