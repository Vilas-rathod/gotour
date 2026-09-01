import { differenceInCalendarDays, format, formatDistanceToNowStrict, parseISO } from 'date-fns';

const CURRENCY_LOCALE: Record<string, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  AED: 'en-AE',
};

/** Money, formatted for the currency's home locale (₹1,24,999 for INR). */
export function formatCurrency(
  amount: number | null | undefined,
  currency = 'INR',
  options: Intl.NumberFormatOptions = {},
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency] ?? 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}

/** Compact money for dashboard tiles: ₹12.4L, ₹1.2Cr, $1.2M. */
export function formatCompactCurrency(amount: number | null | undefined, currency = 'INR'): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency] ?? 'en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN').format(value);
}

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? parseISO(value) : value;
}

/** "12 Mar 2026" */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  try {
    return format(toDate(value), 'dd MMM yyyy');
  } catch {
    return '—';
  }
}

/** "12 Mar 2026, 4:30 PM" */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  try {
    return format(toDate(value), "dd MMM yyyy, h:mm a");
  } catch {
    return '—';
  }
}

/** "3 days ago" */
export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return '—';
  try {
    return `${formatDistanceToNowStrict(toDate(value))} ago`;
  } catch {
    return '—';
  }
}

/** "12 – 19 Mar 2026", collapsing the month when both ends share it. */
export function formatDateRange(start: string | Date, end: string | Date): string {
  try {
    const from = toDate(start);
    const to = toDate(end);
    const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
    return sameMonth
      ? `${format(from, 'dd')} – ${format(to, 'dd MMM yyyy')}`
      : `${format(from, 'dd MMM')} – ${format(to, 'dd MMM yyyy')}`;
  } catch {
    return '—';
  }
}

export function nightsBetween(start: string | Date, end: string | Date): number {
  try {
    return Math.max(0, differenceInCalendarDays(toDate(end), toDate(start)));
  } catch {
    return 0;
  }
}

/** "yyyy-MM-dd" — the shape every backend LocalDate expects. */
export function toIsoDate(value: Date): string {
  return format(value, 'yyyy-MM-dd');
}

/** SCREAMING_SNAKE_CASE → "Screaming snake case" */
export function humanizeEnum(value: string | null | undefined): string {
  if (!value) return '';
  const spaced = value.replace(/_/g, ' ').toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function initialsOf(name: string | null | undefined): string {
  if (!name) return 'GT';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}
