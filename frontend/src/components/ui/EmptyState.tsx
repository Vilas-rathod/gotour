import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      <div className="mb-5 grid size-16 place-items-center rounded-3xl bg-linear-to-br from-brand-50 to-brand-100 text-brand-700 ring-1 ring-brand-600/10 dark:from-brand-950 dark:to-brand-900 dark:text-brand-300 dark:ring-brand-400/15">
        <Icon className="size-7" aria-hidden />
      </div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {description && (
        <p className="text-muted mt-2 max-w-md text-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
