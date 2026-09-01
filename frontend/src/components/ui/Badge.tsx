import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { BookingStatus, PaymentStatus, ReviewStatus } from '@/types/api';
import { humanizeEnum } from '@/lib/format';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'bg-[var(--surface-muted)] text-[var(--text-muted)]',
        brand: 'bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-200',
        success: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200',
        warning: 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200',
        danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200',
        // Gold with dark ink — 9.4:1 — never white on gold.
        accent: 'bg-gold-400 text-brand-950',
        outline: 'border border-current text-[var(--text-muted)]',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: { variant: 'neutral', size: 'md' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
    </span>
  );
}

const BOOKING_STATUS_VARIANT: Record<BookingStatus, BadgeProps['variant']> = {
  PENDING_PAYMENT: 'warning',
  CONFIRMED: 'success',
  COMPLETED: 'brand',
  CANCELLED: 'danger',
};

export function BookingStatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <Badge variant={BOOKING_STATUS_VARIANT[status]} className={className}>
      {humanizeEnum(status)}
    </Badge>
  );
}

const PAYMENT_STATUS_VARIANT: Record<PaymentStatus, BadgeProps['variant']> = {
  CREATED: 'neutral',
  PENDING: 'warning',
  SUCCESS: 'success',
  FAILED: 'danger',
  PARTIALLY_REFUNDED: 'warning',
  REFUNDED: 'neutral',
};

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return (
    <Badge variant={PAYMENT_STATUS_VARIANT[status]} className={className}>
      {humanizeEnum(status)}
    </Badge>
  );
}

const REVIEW_STATUS_VARIANT: Record<ReviewStatus, BadgeProps['variant']> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

export function ReviewStatusBadge({ status, className }: { status: ReviewStatus; className?: string }) {
  return (
    <Badge variant={REVIEW_STATUS_VARIANT[status]} className={className}>
      {humanizeEnum(status)}
    </Badge>
  );
}
