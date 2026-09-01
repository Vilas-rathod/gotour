import { motion } from 'framer-motion';
import { CalendarDays, Check, Download, MapPin, Ticket, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useBookingByReferenceQuery } from '@/features/bookings/bookingsApi';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { BookingStatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Seo } from '@/components/common/Seo';
import { SmartImage } from '@/components/common/SmartImage';
import { formatCurrency, formatDateRange } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useInvoiceDownload } from '@/features/bookings/useInvoiceDownload';

export default function BookingConfirmedPage() {
  const { reference = '' } = useParams();
  const { data: booking, isLoading, isError } = useBookingByReferenceQuery(reference, {
    skip: !reference,
  });
  const { download, isDownloading } = useInvoiceDownload();

  // A confirmed-but-unpaid hotel booking is a cash-on-arrival reservation.
  const payAtHotel = booking?.status === 'CONFIRMED' && booking?.paymentStatus === 'UNPAID';

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Skeleton className="mx-auto h-20 w-20 rounded-2xl" />
        <Skeleton className="mx-auto mt-6 h-8 w-72" />
        <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <EmptyState
          icon={Ticket}
          title="Booking not found"
          description="We could not find that booking reference on your account."
          action={
            <Link to="/account/bookings" className={cn(buttonVariants())}>
              View my bookings
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <>
      <Seo title="Booking confirmed" noIndex />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 260 }}
          className="text-center"
        >
          <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Check className="size-10" strokeWidth={2.5} aria-hidden />
          </span>

          <h1 className="mt-6 text-3xl">{payAtHotel ? "You're reserved!" : "You're going!"}</h1>
          <p className="text-muted mt-2.5">
            {payAtHotel ? (
              <>
                Your room is reserved — pay in cash at the hotel on arrival. A confirmation is on its
                way to{' '}
                <span className="font-semibold text-[var(--text-strong)]">
                  {booking.contactEmail}
                </span>
                .
              </>
            ) : (
              <>
                Your booking is confirmed and a receipt is on the way to{' '}
                <span className="font-semibold text-[var(--text-strong)]">
                  {booking.contactEmail}
                </span>
                .
              </>
            )}
          </p>
        </motion.div>

        <Card className="mt-9 overflow-hidden">
          <div className="relative">
            <SmartImage
              src={booking.itemImageUrl}
              alt={booking.itemTitle}
              wrapperClassName="aspect-[21/9]"
              priority
            />
            <div className="card-scrim absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
              <div className="min-w-0 text-white">
                <p className="text-xs font-semibold tracking-wider text-white/75 uppercase">
                  {booking.bookingType === 'PACKAGE' ? 'Tour package' : 'Hotel stay'}
                </p>
                <h2 className="mt-0.5 truncate font-display text-xl font-semibold">
                  {booking.itemTitle}
                </h2>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>
          </div>

          <CardBody>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--surface-muted)] p-3.5">
              <span className="text-muted text-xs font-semibold tracking-wider uppercase">
                Booking reference
              </span>
              <span className="font-mono text-lg font-bold">{booking.bookingReference}</span>
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-2.5">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand-ink-soft" aria-hidden />
                <div>
                  <dt className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                    Travel dates
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium">
                    {formatDateRange(booking.startDate, booking.endDate)}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Users className="mt-0.5 size-4 shrink-0 text-brand-ink-soft" aria-hidden />
                <div>
                  <dt className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                    Travellers
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium">{booking.travellerCount}</dd>
                </div>
              </div>

              {booking.destinationName && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand-ink-soft" aria-hidden />
                  <div>
                    <dt className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                      Destination
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium">{booking.destinationName}</dd>
                  </div>
                </div>
              )}
            </dl>

            <div className="mt-5 flex items-center justify-between border-t pt-4">
              <span className="text-muted text-sm">{payAtHotel ? 'Due at hotel (cash)' : 'Total paid'}</span>
              <span className="font-display text-2xl font-bold text-brand-ink">
                {formatCurrency(booking.totalAmount, booking.currency)}
              </span>
            </div>
          </CardBody>
        </Card>

        <div className={cn('mt-6 grid gap-3', payAtHotel ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
          {!payAtHotel && (
            <Button
              variant="secondary"
              loading={isDownloading}
              onClick={() => download(booking.bookingReference)}
              leftIcon={<Download className="size-4" />}
            >
              Invoice
            </Button>
          )}
          <Link
            to={`/account/bookings/${booking.bookingReference}`}
            className={cn(buttonVariants({ variant: 'secondary' }))}
          >
            View booking
          </Link>
          <Link to="/packages" className={cn(buttonVariants())}>
            Plan another trip
          </Link>
        </div>
      </div>
    </>
  );
}
