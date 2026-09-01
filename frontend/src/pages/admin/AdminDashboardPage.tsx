import {
  BadgeCheck,
  CalendarClock,
  CircleDollarSign,
  MessageSquareWarning,
  Ticket,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminBookingStatsQuery } from '@/features/bookings/bookingsApi';
import { useAdminRevenueStatsQuery } from '@/features/payments/paymentsApi';
import { useAdminCustomerGrowthQuery } from '@/features/profile/profileApi';
import { useAdminReviewStatsQuery } from '@/features/reviews/reviewsApi';
import { StatTile } from '@/components/admin/StatTile';
import { BookingsChart, RevenueChart, TopSellingChart } from '@/components/admin/Charts';
import { Card, CardBody } from '@/components/ui/Card';
import { buttonVariants } from '@/components/ui/Button';
import { Seo } from '@/components/common/Seo';
import { formatCompactCurrency, formatCurrency, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { data: bookingStats, isLoading: bookingsLoading } = useAdminBookingStatsQuery();
  const { data: revenueStats, isLoading: revenueLoading } = useAdminRevenueStatsQuery();
  const { data: customers, isLoading: customersLoading } = useAdminCustomerGrowthQuery();
  const { data: reviews, isLoading: reviewsLoading } = useAdminReviewStatsQuery();

  const money = (value: number) => formatCompactCurrency(value, 'INR');

  return (
    <>
      <Seo title="Admin dashboard" noIndex />

      <div className="mb-7">
        <h1 className="text-2xl sm:text-3xl">Dashboard</h1>
        <p className="text-muted mt-1.5 text-sm">
          Revenue, bookings and customer growth across the GoTour platform.
        </p>
      </div>

      {/* ------------------------------------------------------ KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={CircleDollarSign}
          label="Net revenue"
          value={formatCurrency(revenueStats?.netRevenue ?? 0, 'INR')}
          hint={
            revenueStats
              ? `${formatCurrency(revenueStats.refunded, 'INR')} refunded`
              : undefined
          }
          loading={revenueLoading}
          tone="success"
        />
        <StatTile
          icon={Ticket}
          label="Total bookings"
          value={formatNumber(bookingStats?.totalBookings ?? 0)}
          hint={
            bookingStats ? `${formatNumber(bookingStats.bookingsLast30Days)} in last 30 days` : undefined
          }
          loading={bookingsLoading}
        />
        <StatTile
          icon={Users}
          label="Customers"
          value={formatNumber(customers?.totalCustomers ?? 0)}
          hint={customers ? `${formatNumber(customers.newLast30Days)} joined in 30 days` : undefined}
          loading={customersLoading}
        />
        <StatTile
          icon={MessageSquareWarning}
          label="Reviews pending"
          value={formatNumber(reviews?.pending ?? 0)}
          hint={reviews ? `${formatNumber(reviews.approved)} approved` : undefined}
          loading={reviewsLoading}
          tone={reviews && reviews.pending > 0 ? 'warning' : 'brand'}
        />
      </div>

      {/* -------------------------------------------- booking status row */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={CalendarClock}
          label="Awaiting payment"
          value={formatNumber(bookingStats?.pendingBookings ?? 0)}
          loading={bookingsLoading}
          tone="warning"
        />
        <StatTile
          icon={BadgeCheck}
          label="Confirmed"
          value={formatNumber(bookingStats?.confirmedBookings ?? 0)}
          loading={bookingsLoading}
          tone="success"
        />
        <StatTile
          icon={TrendingUp}
          label="Completed"
          value={formatNumber(bookingStats?.completedBookings ?? 0)}
          loading={bookingsLoading}
        />
        <StatTile
          icon={XCircle}
          label="Cancelled"
          value={formatNumber(bookingStats?.cancelledBookings ?? 0)}
          loading={bookingsLoading}
          tone="danger"
        />
      </div>

      {/* -------------------------------------------------------- charts */}
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <RevenueChart
          data={revenueStats?.monthlyRevenue ?? []}
          loading={revenueLoading}
          formatValue={money}
        />
        <BookingsChart
          data={bookingStats?.monthlyTrend ?? []}
          loading={bookingsLoading}
          formatValue={money}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <TopSellingChart
          data={bookingStats?.topSelling ?? []}
          loading={bookingsLoading}
          formatValue={money}
        />

        <Card>
          <CardBody>
            <h3 className="font-display text-base font-semibold">Payment health</h3>
            <p className="text-muted mt-0.5 text-xs">Gateway outcomes across all transactions</p>

            <dl className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted text-sm">Gross revenue</dt>
                <dd className="font-semibold tabular-nums">
                  {formatCurrency(revenueStats?.grossRevenue ?? 0, 'INR')}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted text-sm">Refunded</dt>
                <dd className="font-semibold tabular-nums">
                  {formatCurrency(revenueStats?.refunded ?? 0, 'INR')}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t pt-4">
                <dt className="text-sm font-semibold">Net revenue</dt>
                <dd className="font-display text-lg font-bold text-brand-700 tabular-nums dark:text-brand-400">
                  {formatCurrency(revenueStats?.netRevenue ?? 0, 'INR')}
                </dd>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t pt-4">
                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                  <dt className="text-muted text-[11px] font-bold tracking-wider uppercase">
                    Successful
                  </dt>
                  <dd className="mt-0.5 text-lg font-bold tabular-nums">
                    {formatNumber(revenueStats?.successfulPayments ?? 0)}
                  </dd>
                </div>
                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                  <dt className="text-muted text-[11px] font-bold tracking-wider uppercase">
                    Failed
                  </dt>
                  <dd className="mt-0.5 text-lg font-bold tabular-nums">
                    {formatNumber(revenueStats?.failedPayments ?? 0)}
                  </dd>
                </div>
              </div>
            </dl>

            <Link
              to="/admin/payments"
              className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'mt-5 w-full')}
            >
              View all transactions
            </Link>
          </CardBody>
        </Card>
      </div>

      {/* -------------------------------------------------- quick links */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Moderate reviews', to: '/admin/reviews', icon: MessageSquareWarning },
          { label: 'Manage bookings', to: '/admin/bookings', icon: Ticket },
          { label: 'View customers', to: '/admin/customers', icon: UserPlus },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="surface-card flex items-center gap-3 rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
              <link.icon className="size-4.5" aria-hidden />
            </span>
            <span className="text-sm font-semibold">{link.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
