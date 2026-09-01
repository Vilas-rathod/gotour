import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useState, type ReactNode } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppSelector } from '@/app/hooks';
import { cn } from '@/lib/utils';

/**
 * Chart palette.
 *
 * Every chart here is single-series, so magnitude is carried by one hue
 * (sequential) rather than a categorical set — there is nothing to tell apart,
 * so there is no legend and no risk of colour-only encoding. Both steps were
 * validated against the GoTour surfaces (#ffffff light, #071313 dark) for the
 * lightness band, chroma floor and >= 3:1 contrast.
 *
 * Two measures of different scale are NEVER put on one plot with two y-axes;
 * revenue and booking volume are separate charts sharing an x-axis instead.
 */
interface ChartTheme {
  series: string;
  grid: string;
  axis: string;
  surface: string;
  ink: string;
}

const CHART_COLORS: Record<'light' | 'dark', ChartTheme> = {
  light: {
    series: '#059583',
    grid: '#e1e0d9',
    axis: '#898781',
    surface: '#ffffff',
    ink: '#0b0b0b',
  },
  dark: {
    series: '#00a692',
    grid: '#21302f',
    axis: '#898781',
    surface: '#0f1c1b',
    ink: '#ffffff',
  },
};

function useChartTheme(): ChartTheme {
  const theme = useAppSelector((state) => state.ui.theme);
  return CHART_COLORS[theme];
}

/**
 * Recharts types the tooltip value as `ValueType | undefined`, so the formatter
 * takes `unknown` and coerces rather than lying about the input type.
 */
function seriesFormatter(label: string, format?: (value: number) => string) {
  return (value: unknown): [string, string] => {
    const numeric = Number(value ?? 0);
    return [format ? format(numeric) : String(numeric), label];
  };
}

// ------------------------------------------------------------------- shell

interface ChartShellProps {
  title: string;
  description?: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  /** Accessible fallback: the same numbers as a table. */
  table: ReactNode;
  children: ReactNode;
}

function ChartShell({
  title,
  description,
  loading,
  empty,
  emptyMessage = 'No data for this period yet.',
  table,
  children,
}: ChartShellProps) {
  const [showTable, setShowTable] = useState(false);

  return (
    <Card>
      <CardBody>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold">{title}</h3>
            {description && <p className="text-muted mt-0.5 text-xs">{description}</p>}
          </div>

          <button
            type="button"
            onClick={() => setShowTable((open) => !open)}
            aria-pressed={showTable}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              showTable ? 'border-brand-600 bg-brand-600 text-white' : 'hover:bg-[var(--surface-muted)]',
            )}
          >
            {showTable ? 'Show chart' : 'View as table'}
          </button>
        </div>

        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : empty ? (
          <p className="text-muted grid h-64 place-items-center text-sm">{emptyMessage}</p>
        ) : showTable ? (
          <div className="max-h-64 overflow-auto">{table}</div>
        ) : (
          <div className="h-64">{children}</div>
        )}
      </CardBody>
    </Card>
  );
}

function MiniTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          {headers.map((header, index) => (
            <th
              key={header}
              scope="col"
              className={cn(
                'px-2 py-2 text-[11px] font-bold tracking-wider uppercase',
                index === 0 ? 'text-left' : 'text-right',
              )}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="border-b last:border-0">
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className={cn(
                  'px-2 py-2',
                  cellIndex === 0 ? 'text-left' : 'text-right tabular-nums',
                )}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Tooltip styled to the app surface rather than Recharts' default white box. */
function tooltipStyles(theme: ChartTheme) {
  return {
    contentStyle: {
      background: theme.surface,
      border: `1px solid ${theme.grid}`,
      borderRadius: '0.75rem',
      fontSize: '0.8125rem',
      boxShadow: '0 8px 24px -8px rgb(0 0 0 / 0.25)',
      color: theme.ink,
    },
    labelStyle: { color: theme.axis, fontSize: '0.6875rem', marginBottom: 4 },
    cursor: { fill: theme.grid, fillOpacity: 0.35 },
  };
}

// -------------------------------------------------------------- revenue

export interface RevenueChartProps {
  data: { period: string; revenue: number; transactions: number }[];
  loading?: boolean;
  formatValue: (value: number) => string;
}

export function RevenueChart({ data, loading, formatValue }: RevenueChartProps) {
  const theme = useChartTheme();
  const styles = tooltipStyles(theme);

  return (
    <ChartShell
      title="Net revenue"
      description="Settled payments per month, refunds deducted"
      loading={loading}
      empty={data.length === 0}
      table={
        <MiniTable
          headers={['Month', 'Revenue', 'Transactions']}
          rows={data.map((point) => [point.period, formatValue(point.revenue), point.transactions])}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.series} stopOpacity={0.28} />
              <stop offset="100%" stopColor={theme.series} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="period"
            stroke={theme.axis}
            tickLine={false}
            axisLine={{ stroke: theme.grid }}
            tick={{ fontSize: 11, fill: theme.axis }}
          />
          <YAxis
            stroke={theme.axis}
            tickLine={false}
            axisLine={false}
            width={64}
            tick={{ fontSize: 11, fill: theme.axis }}
            tickFormatter={(value: number) => formatValue(value)}
          />
          <Tooltip {...styles} formatter={seriesFormatter('Revenue', formatValue)} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={theme.series}
            strokeWidth={2}
            fill="url(#revenueFill)"
            activeDot={{ r: 5, strokeWidth: 2, stroke: theme.surface }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

// ------------------------------------------------------------- bookings

export interface BookingsChartProps {
  data: { period: string; bookings: number; revenue: number }[];
  loading?: boolean;
  formatValue: (value: number) => string;
}

export function BookingsChart({ data, loading, formatValue }: BookingsChartProps) {
  const theme = useChartTheme();
  const styles = tooltipStyles(theme);

  return (
    <ChartShell
      title="Bookings per month"
      description="Confirmed and completed bookings"
      loading={loading}
      empty={data.length === 0}
      table={
        <MiniTable
          headers={['Month', 'Bookings', 'Revenue']}
          rows={data.map((point) => [point.period, point.bookings, formatValue(point.revenue)])}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="period"
            stroke={theme.axis}
            tickLine={false}
            axisLine={{ stroke: theme.grid }}
            tick={{ fontSize: 11, fill: theme.axis }}
          />
          <YAxis
            stroke={theme.axis}
            tickLine={false}
            axisLine={false}
            width={40}
            allowDecimals={false}
            tick={{ fontSize: 11, fill: theme.axis }}
          />
          <Tooltip {...styles} formatter={seriesFormatter('Bookings')} />
          {/* 4px rounded data-end, square against the baseline. */}
          <Bar dataKey="bookings" fill={theme.series} radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

// ---------------------------------------------------------- top sellers

export interface TopSellingChartProps {
  data: { title: string; bookings: number; revenue: number }[];
  loading?: boolean;
  formatValue: (value: number) => string;
}

export function TopSellingChart({ data, loading, formatValue }: TopSellingChartProps) {
  const theme = useChartTheme();
  const styles = tooltipStyles(theme);

  // Horizontal bars keep long package names readable without rotated labels.
  const rows = data.slice(0, 6).map((item) => ({
    ...item,
    label: item.title.length > 26 ? `${item.title.slice(0, 25)}…` : item.title,
  }));

  return (
    <ChartShell
      title="Top selling packages"
      description="By booking volume"
      loading={loading}
      empty={rows.length === 0}
      table={
        <MiniTable
          headers={['Package', 'Bookings', 'Revenue']}
          rows={data.map((item) => [item.title, item.bookings, formatValue(item.revenue)])}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
          barCategoryGap="26%"
        >
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            stroke={theme.axis}
            tickLine={false}
            axisLine={{ stroke: theme.grid }}
            allowDecimals={false}
            tick={{ fontSize: 11, fill: theme.axis }}
          />
          <YAxis
            type="category"
            dataKey="label"
            stroke={theme.axis}
            tickLine={false}
            axisLine={false}
            width={150}
            tick={{ fontSize: 11, fill: theme.axis }}
          />
          <Tooltip {...styles} formatter={seriesFormatter('Bookings')} />
          <Bar dataKey="bookings" radius={[0, 4, 4, 0]} maxBarSize={26}>
            {rows.map((row) => (
              <Cell key={row.title} fill={theme.series} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
