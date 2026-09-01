import type { LucideIcon } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: 'brand' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}

// Each tone is a two-stop gradient plus a matching hairline ring, so the
// tiles read as small objects rather than flat colour swatches.
const TONES = {
  brand:
    'bg-linear-to-br from-brand-50 to-brand-100 text-brand-700 ring-brand-600/12 dark:from-brand-950 dark:to-brand-900 dark:text-brand-300 dark:ring-brand-400/18',
  success:
    'bg-linear-to-br from-emerald-50 to-emerald-100 text-emerald-700 ring-emerald-600/12 dark:from-emerald-950 dark:to-emerald-900 dark:text-emerald-300 dark:ring-emerald-400/18',
  warning:
    'bg-linear-to-br from-amber-50 to-amber-100 text-amber-700 ring-amber-600/12 dark:from-amber-950 dark:to-amber-900 dark:text-amber-300 dark:ring-amber-400/18',
  danger:
    'bg-linear-to-br from-rose-50 to-rose-100 text-rose-700 ring-rose-600/12 dark:from-rose-950 dark:to-rose-900 dark:text-rose-300 dark:ring-rose-400/18',
} as const;

export function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'brand',
  loading = false,
}: StatTileProps) {
  return (
    <Card className="transition-shadow hover:elev-2">
      <CardBody className="flex items-start gap-4">
        <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl ring-1', TONES[tone])}>
          <Icon className="size-5" aria-hidden />
        </span>

        <div className="min-w-0">
          <p className="text-faint text-[10px] font-bold tracking-[0.16em] uppercase">{label}</p>
          {loading ? (
            <Skeleton className="mt-1.5 h-7 w-24" />
          ) : (
            <p className="font-display nums-tabular mt-1 text-2xl font-bold">{value}</p>
          )}
          {hint && <p className="text-muted mt-1 text-xs">{hint}</p>}
        </div>
      </CardBody>
    </Card>
  );
}
