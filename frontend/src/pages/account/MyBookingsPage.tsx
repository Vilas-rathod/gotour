import { CalendarDays, Download, MapPin, Ticket, Users, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useCancelBookingMutation,
  useMyBookingsQuery,
} from '@/features/bookings/bookingsApi';
import { useInvoiceDownload } from '@/features/bookings/useInvoiceDownload';
import { BookingStatusBadge, Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Seo } from '@/components/common/Seo';
import { SmartImage } from '@/components/common/SmartImage';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDateRange, humanizeEnum } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function MyBookingsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useMyBookingsQuery({ page, size: 8 });
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  const { download, isDownloading } = useInvoiceDownload();
  const toast = useToast();

  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const handleCancel = async () => {
    if (!cancelTarget) return;
    if (reason.trim().length < 5) {
      toast.error('Tell us briefly why you are cancelling');
      return;
    }

    try {
      await cancelBooking({ reference: cancelTarget, reason: reason.trim() }).unwrap();
      toast.success('Booking cancelled', 'Any refund due will be processed within 5–7 days.');
      setCancelTarget(null);
      setReason('');
    } catch (error) {
      toast.apiError(error, 'Could not cancel this booking');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!data || data.content.length === 0) {
    return (
      <>
        <Seo title="My bookings" noIndex />
        <EmptyState
          icon={Ticket}
          title="No bookings yet"
          description="Once you book a trip it will appear here with your itinerary, invoice and status."
          action={
            <Link to="/packages" className={cn(buttonVariants())}>
              Browse tour packages
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <Seo title="My bookings" noIndex />

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl">My bookings</h2>
        <span className="text-muted text-sm">{data.totalElements} total</span>
      </div>

      <ul className="space-y-4">
        {data.content.map((booking) => {
          const canCancel = booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT';

          return (
            <li key={booking.bookingReference}>
              <Card className="overflow-hidden">
                <div className="grid sm:grid-cols-[200px_1fr]">
                  <Link
                    to={`/account/bookings/${booking.bookingReference}`}
                    className="group relative block"
                  >
                    <SmartImage
                      src={booking.itemImageUrl}
                      alt={booking.itemTitle}
                      wrapperClassName="aspect-[16/10] sm:h-full sm:aspect-auto"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  <CardBody>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="neutral" size="sm">
                            {humanizeEnum(booking.bookingType)}
                          </Badge>
                          <BookingStatusBadge status={booking.status} />
                          {booking.paymentStatus === 'UNPAID' && (
                            <Badge variant="warning" size="sm">
                              Payment pending
                            </Badge>
                          )}
                        </div>

                        <Link
                          to={`/account/bookings/${booking.bookingReference}`}
                          className="mt-2 block font-display text-lg font-semibold hover:text-brand-ink"
                        >
                          {booking.itemTitle}
                        </Link>

                        <p className="text-muted mt-1 font-mono text-xs">
                          {booking.bookingReference}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-display text-xl font-bold text-brand-ink">
                          {formatCurrency(booking.totalAmount, booking.currency)}
                        </span>
                      </div>
                    </div>

                    <div className="text-muted mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" aria-hidden />
                        {formatDateRange(booking.startDate, booking.endDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="size-3.5" aria-hidden />
                        {booking.travellerCount}{' '}
                        {booking.travellerCount === 1 ? 'traveller' : 'travellers'}
                      </span>
                      {booking.destinationName && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5" aria-hidden />
                          {booking.destinationName}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <Link
                        to={`/account/bookings/${booking.bookingReference}`}
                        className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                      >
                        View details
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        loading={isDownloading}
                        onClick={() => download(booking.bookingReference)}
                        leftIcon={<Download className="size-4" />}
                      >
                        Invoice
                      </Button>

                      {booking.paymentStatus === 'UNPAID' && booking.status !== 'CANCELLED' && (
                        <Link
                          to={`/account/bookings/${booking.bookingReference}`}
                          className={cn(buttonVariants({ variant: 'accent', size: 'sm' }))}
                        >
                          Complete payment
                        </Link>
                      )}

                      {canCancel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                          onClick={() => setCancelTarget(booking.bookingReference)}
                          leftIcon={<XCircle className="size-4" />}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        onPageChange={setPage}
        className="mt-8"
      />

      <Modal
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        title="Cancel this booking?"
        description="Refunds follow the cancellation policy on your booking. This cannot be undone."
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>
              Keep booking
            </Button>
            <Button variant="danger" loading={isCancelling} onClick={handleCancel}>
              Confirm cancellation
            </Button>
          </div>
        }
      >
        <Textarea
          label="Reason for cancelling"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Plans changed, found a different date, etc."
          required
        />
      </Modal>
    </>
  );
}
