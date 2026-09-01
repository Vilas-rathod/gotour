import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Hide on small screens where horizontal space is tight. */
  hideBelow?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  loading?: boolean;
  emptyState?: ReactNode;
  caption: string;
}

const HIDE_CLASS = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
} as const;

/** Admin table that scrolls horizontally rather than breaking the layout. */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading = false,
  emptyState,
  caption,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <Card className="p-4">
        <TableSkeleton rows={6} columns={Math.min(columns.length, 5)} />
      </Card>
    );
  }

  if (rows.length === 0 && emptyState) {
    return <Card>{emptyState}</Card>;
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b bg-[var(--surface-muted)]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-[11px] font-bold tracking-wider uppercase',
                    column.align === 'right' ? 'text-right' : 'text-left',
                    column.hideBelow && HIDE_CLASS[column.hideBelow],
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="border-b transition-colors last:border-0 hover:bg-[var(--surface-muted)]"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3.5',
                      column.align === 'right' ? 'text-right' : 'text-left',
                      column.hideBelow && HIDE_CLASS[column.hideBelow],
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
