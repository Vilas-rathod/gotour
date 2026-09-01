import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('surface-card rounded-2xl', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  title,
  description,
  action,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn('flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6', className)}
      {...props}
    >
      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold">{title}</h3>
        {description && <p className="text-muted mt-0.5 text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 sm:p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-t px-5 py-4 sm:px-6', className)} {...props}>
      {children}
    </div>
  );
}
