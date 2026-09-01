import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'group/btn relative isolate inline-flex items-center justify-center gap-2 overflow-hidden',
    'rounded-full font-semibold tracking-[-0.01em] whitespace-nowrap select-none',
    // A slightly overshooting curve on the lift, a flat one on the press, so
    // the button feels sprung rather than linear.
    'transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
    'hover:-translate-y-px active:translate-y-0 active:scale-[0.985]',
    'disabled:pointer-events-none disabled:opacity-55 disabled:shadow-none',
  ],
  {
    variants: {
      variant: {
        // Gradient between two measured steps rather than a flat fill, so the
        // face has a light source. White ink on brand-700 is 7.7:1; dark ink
        // on brand-400 is 7.6:1 — the gradient stays inside those bounds.
        primary: [
          'bg-linear-to-b from-brand-600 to-brand-800 text-white',
          'shadow-[0_1px_0_0_oklch(1_0_0/0.22)_inset,0_10px_24px_-10px_oklch(0.352_0.062_197/0.65)]',
          'hover:from-brand-500 hover:to-brand-700',
          'hover:shadow-[0_1px_0_0_oklch(1_0_0/0.28)_inset,0_16px_32px_-12px_oklch(0.352_0.062_197/0.72)]',
          'dark:from-brand-300 dark:to-brand-500 dark:text-brand-950',
          'dark:hover:from-brand-200 dark:hover:to-brand-400',
        ],
        // Gold is the premium CTA and always carries dark ink — 7.6:1.
        accent: [
          'sheen bg-linear-to-b from-gold-300 to-gold-500 text-brand-950',
          'shadow-[0_1px_0_0_oklch(1_0_0/0.4)_inset,0_10px_24px_-10px_oklch(0.648_0.126_82/0.7)]',
          'hover:from-gold-200 hover:to-gold-400',
          'hover:shadow-[0_1px_0_0_oklch(1_0_0/0.5)_inset,0_16px_32px_-12px_oklch(0.648_0.126_82/0.78)]',
        ],
        secondary: [
          'bg-[var(--surface-raised)] text-[var(--text-strong)] border border-[var(--border-subtle)]',
          'elev-1 hover:bg-[var(--surface-muted)] hover:border-strong hover:elev-2',
        ],
        outline:
          'border border-brand-600/45 text-brand-ink hover:border-brand-600/80 hover:bg-brand-50 dark:border-brand-400/45 dark:hover:border-brand-400/80 dark:hover:bg-brand-950/50',
        ghost: 'text-[var(--text-strong)] hover:bg-[var(--surface-muted)]',
        danger:
          'bg-linear-to-b from-rose-500 to-rose-700 text-white shadow-[0_10px_24px_-10px_oklch(0.485_0.175_22/0.7)] hover:from-rose-400 hover:to-rose-600',
        // Sits on photography, so it gets the dark-tinted glass, never the
        // surface-tinted one — a bright sky would otherwise erase the label.
        glass: 'glass-on-media text-white hover:bg-white/25 elev-2',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-13 px-8 text-base',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
      },
      fullWidth: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', fullWidth: false },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  className,
  variant,
  size,
  fullWidth,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

export { buttonVariants };
