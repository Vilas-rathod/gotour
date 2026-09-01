import {
  Banknote,
  CalendarDays,
  CreditCard,
  Download,
  Mail,
  MapPin,
  Phone,
  Ticket,
  Users,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useBookingByReferenceQuery,
  useCancelBookingMutation,
} from '@/features/bookings/bookingsApi';
import { usePaymentForBookingQuery } from '@/features/payments/paymentsApi';
import { useRazorpayCheckout } from '@/features/payments/useRazorpayCheckout';
import { useInvoiceDownload } from '@/features/bookings/useInvoiceDownload';
import { Badge, BookingStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Seo } from '@/components/common/Seo';
import { BackLink } from '@/components/common/BackLink';
import { SmartImage } from '@/components/common/SmartImage';
import { useToast } from '@/hooks/useToast';
import {
  formatCurrency,
  formatDate,
  formatDateRange,
  formatDateTime,
  humanizeEnum,
} from '@/lib/format';
import { cn } from '@/lib/utils';

export default function BookingDetailPage() {
  const { reference = '' } = useParams();
  const toast = useToast();

  const {
    data: booking,
    isLoading,
    isError,
    refetch,
  } = useBookingByReferenceQuery(reference, { skip: !reference });
  const { data: payment } = usePaymentForBookingQuery(reference, { skip: !reference });

  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  const payWithRazorpay = useRazorpayCheckout();
  const { download, isDownloading } = useInvoiceDownload();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <EmptyState
        icon={Ticket}
        title="Booking not found"
        description="We could not find that booking on your account."
        action={
          <Link to="/account/bookings" className={cn(buttonVariants())}>
            Back to my bookings
          </Link>
        }
      />
    );
  }

  const canCancel = booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT';
  // An online payment is due only while the booking is still pending payment.
  const needsPayment = booking.status === 'PENDING_PAYMENT' && booking.paymentStatus === 'UNPAID';
  // A confirmed-but-unpaid hotel booking is a cash-on-arrival reservation.
  const payAtHotel = booking.status === 'CONFIRMED' && booking.paymentStatus === 'UNPAID';
  const itemLink =
    booking.bookingType === 'PACKAGE' ? `/packages/${booking.itemSlug}` : `/hotels/${booking.itemSlug}`;

  const handleCancel = async () => {
    if (reason.trim().length < 5) {
      toast.error('Tell us briefly why you are cancelling');
      return;
    }
    try {
      await cancelBooking({ reference, reason: reason.trim() }).unwrap();
      toast.success('Booking cancelled');
      setCancelOpen(false);
    } catch (error) {
      toast.apiError(error, 'Could not cancel this booking');
    }
  };

  const handlePay = async () => {
    setIsPaying(true);
    await payWithRazorpay({
      bookingReference: reference,
      prefill: {
        name: booking.travellers.find((traveller) => traveller.leadTraveller)?.fullName,
        email: booking.contactEmail,
        contact: booking.contactPhone,
      },
      onSuccess: () => {
        toast.success('Payment successful', 'Your booking is confirmed.');
        setIsPaying(false);
        refetch();
      },
      onError: (error) => {
        toast.apiError(error, 'Payment could not be completed');
        setIsPaying(false);
      },
      onDismiss: () => {
        toast.info('Payment cancelled');
        setIsPaying(false);
      },
    });
  };

  return (
    <>
      <Seo title={`Booking ${booking.bookingReference}`} noIndex />

      <BackLink fallbackTo="/account/bookings" label="All bookings" className="mb-5" />

      <Card className="overflow-hidden">
        <div className="relative">
          <SmartImage
            src={booking.itemImageUrl}
            alt={booking.itemTitle}
            wrapperClassName="aspect-[21/9]"
            priority
          />
          <div className="card-scrim absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5">
            <div className="min-w-0 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral" size="sm">
                  {humanizeEnum(booking.bookingType)}
                </Badge>
                <BookingStatusBadge status={booking.status} />
              </div>
              <Link
                to={itemLink}
                className="mt-2 block font-display text-2xl font-semibold hover:underline"
              >
                {booking.itemTitle}
              </Link>
              {booking.destinationName && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin className="size-3.5" aria-hidden />
                  {booking.destinationName}
                </p>
              )}
            </div>
          </div>
        </div>

        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--surface-muted)] p-3.5">
            <span className="text-muted text-xs font-semibold tracking-wider uppercase">
              Reference
            </span>
            <span className="font-mono text-lg font-bold">{booking.bookingReference}</span>
          </div>

          <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-2.5">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand-ink-soft" aria-hidden />
              <div>
                <dt className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                  Travel dates
                </dt>
                <dd className="mt-0.5 text-sm font-medium">
                  {formatDateRange(booking.startDate, booking.endDate)}
                </dd>
                {booking.nights > 0 && (
                  <dd className="text-muted text-xs">
                    {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                  </dd>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Users className="mt-0.5 size-4 shrink-0 text-brand-ink-soft" aria-hidden />
              <div>
                <dt className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                  Travellers
                </dt>
                <dd className="mt-0.5 text-sm font-medium">{booking.travellerCount}</dd>
                {booking.roomType && <dd className="text-muted text-xs">{booking.roomType}</dd>}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CreditCard className="mt-0.5 size-4 shrink-0 text-brand-ink-soft" aria-hidden />
              <div>
                <dt className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                  Payment
                </dt>
                <dd className="mt-1">
                  {payment ? (
                    <PaymentStatusBadge status={payment.status} />
                  ) : (
                    <Badge variant={booking.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm">
                      {humanizeEnum(booking.paymentStatus)}
                    </Badge>
                  )}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Ticket className="mt-0.5 size-4 shrink-0 text-brand-ink-soft" aria-hidden />
              <div>
                <dt className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                  Booked on
                </dt>
                <dd className="mt-0.5 text-sm font-medium">{formatDate(booking.createdAt)}</dd>
              </div>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t pt-5">
            {needsPayment && (
              <Button variant="accent" loading={isPaying} onClick={handlePay}>
                Pay {formatCurrency(booking.totalAmount, booking.currency)}
              </Button>
            )}
            {payAtHotel && (
              <span className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                <Banknote className="size-4 shrink-0" aria-hidden />
                Pay {formatCurrency(booking.totalAmount, booking.currency)} in cash at the hotel
              </span>
            )}
            {booking.paymentStatus === 'PAID' && (
              <Button
                variant="secondary"
                loading={isDownloading}
                onClick={() => download(booking.bookingReference)}
                leftIcon={<Download className="size-4" />}
              >
                Download invoice
              </Button>
            )}
            {canCancel && (
              <Button
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                onClick={() => setCancelOpen(true)}
                leftIcon={<XCircle className="size-4" />}
              >
                Cancel booking
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {booking.status === 'CANCELLED' && (
        <Card className="mt-5 border-rose-300 dark:border-rose-900">
          <CardBody>
            <h3 className="font-display font-semibold text-rose-700 dark:text-rose-400">
              Booking cancelled
            </h3>
            <p className="text-muted mt-1.5 text-sm">
              Cancelled on {formatDateTime(booking.cancelledAt)}.
              {booking.cancellationReason ? ` Reason: ${booking.cancellationReason}` : ''}
            </p>
            {booking.refundAmount !== null && booking.refundAmount > 0 && (
              <p className="mt-2 text-sm font-semibold">
                Refund issued: {formatCurrency(booking.refundAmount, booking.currency)}
              </p>
            )}
          </CardBody>
        </Card>
      )}

      {/* ------------------------------------------------------ travellers */}
      <Card className="mt-5">
        <CardBody>
          <h3 className="font-display text-lg font-semibold">Travellers</h3>
          <ul className="mt-3 divide-y">
            {booking.travellers.map((traveller) => (
              <li key={traveller.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {traveller.fullName}
                    {traveller.leadTraveller && (
                      <Badge variant="brand" size="sm" className="ml-2">
                        Lead
                      </Badge>
                    )}
                  </p>
                  <p className="text-muted text-xs">
                    {traveller.age} yrs · {humanizeEnum(traveller.gender)}
                    {traveller.nationality ? ` · ${traveller.nationality}` : ''}
                  </p>
                </div>
                {traveller.passportNumber && (
                  <span className="text-muted shrink-0 font-mono text-xs">
                    {traveller.passportNumber}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {/* ------------------------------------------------------ price break */}
      <Card className="mt-5">
        <CardBody>
          <h3 className="font-display text-lg font-semibold">Price breakdown</h3>
          <dl className="mt-3 space-y-2 text-sm">
            {booking.items.map((item) => (
              <div key={item.label} className="flex justify-between gap-4">
                <dt className="text-muted min-w-0">
                  {item.label}
                  <span className="ml-1.5">
                    ({formatCurrency(item.unitPrice, booking.currency)} × {item.quantity})
                  </span>
                </dt>
                <dd className="shrink-0 font-medium">
                  {formatCurrency(item.amount, booking.currency)}
                </dd>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2.5 text-base font-bold">
              <dt>Total</dt>
              <dd className="text-brand-ink">
                {formatCurrency(booking.totalAmount, booking.currency)}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      {/* ---------------------------------------------------------- contact */}
      <Card className="mt-5">
        <CardBody>
          <h3 className="font-display text-lg font-semibold">Contact details</h3>
          <ul className="text-muted mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0" aria-hidden />
              {booking.contactEmail}
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0" aria-hidden />
              {booking.contactPhone}
            </li>
          </ul>
          {booking.specialRequests && (
            <div className="mt-4 rounded-xl bg-[var(--surface-muted)] p-3.5">
              <p className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                Special requests
              </p>
              <p className="mt-1 text-sm">{booking.specialRequests}</p>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this booking?"
        description="Refunds follow the cancellation policy on your booking. This cannot be undone."
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
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
