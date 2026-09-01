import { zodResolver } from '@hookform/resolvers/zod';
import {
  Banknote,
  CalendarDays,
  Check,
  Lock,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useCreateBookingMutation } from '@/features/bookings/bookingsApi';
import { useInitiatePaymentMutation } from '@/features/payments/paymentsApi';
import { useRazorpayCheckout } from '@/features/payments/useRazorpayCheckout';
import { usePackageBySlugQuery } from '@/features/packages/packagesApi';
import { useHotelBySlugQuery } from '@/features/hotels/hotelsApi';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Seo } from '@/components/common/Seo';
import { BackLink } from '@/components/common/BackLink';
import { SmartImage } from '@/components/common/SmartImage';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDateRange, nightsBetween } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { BookingType, CreateBookingRequest, PaymentMethod } from '@/types/api';

// --------------------------------------------------------------- validation

const travellerSchema = z.object({
  fullName: z.string().min(2, 'Enter the traveller name').max(120),
  age: z.coerce.number().int().min(1, 'Enter an age').max(120, 'Enter a valid age'),
  gender: z.string().min(1, 'Select a gender'),
  passportNumber: z.string().max(40).optional().or(z.literal('')),
  nationality: z.string().max(60).optional().or(z.literal('')),
});

const checkoutSchema = z.object({
  travellers: z.array(travellerSchema).min(1, 'Add at least one traveller'),
  contactEmail: z.string().min(1, 'Email is required').email('Enter a valid email'),
  contactPhone: z.string().regex(/^\+?[0-9\s-]{7,20}$/, 'Enter a valid phone number'),
  specialRequests: z.string().max(500, 'Keep requests under 500 characters').optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

/** Navigation state handed over by the package/hotel detail pages. */
interface CheckoutState {
  departureDate?: string;
  startDate?: string;
  endDate?: string;
  travellers?: number;
  roomId?: number;
  roomType?: string;
  roomCount?: number;
  unitPrice?: number;
  nights?: number;
}

const STEPS = ['Traveller details', 'Review', 'Payment'] as const;

export default function CheckoutPage() {
  const { type, slug = '' } = useParams<{ type: 'package' | 'hotel'; slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user } = useAuth();

  const state = (location.state ?? {}) as CheckoutState;
  const bookingType: BookingType = type === 'hotel' ? 'HOTEL' : 'PACKAGE';

  const { data: pkg, isLoading: pkgLoading } = usePackageBySlugQuery(slug, {
    skip: bookingType !== 'PACKAGE' || !slug,
  });
  const { data: hotel, isLoading: hotelLoading } = useHotelBySlugQuery(slug, {
    skip: bookingType !== 'HOTEL' || !slug,
  });

  const [step, setStep] = useState(0);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  // Cash on arrival is offered for hotel stays only; everything else pays online.
  const [method, setMethod] = useState<PaymentMethod>('RAZORPAY');

  const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();
  const [initiatePayment, { isLoading: isInitiating }] = useInitiatePaymentMutation();
  const payWithRazorpay = useRazorpayCheckout();
  const [isPaying, setIsPaying] = useState(false);

  const travellerCount = state.travellers ?? 1;

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      travellers: Array.from({ length: travellerCount }, (_, index) => ({
        fullName: index === 0 ? (user?.fullName ?? '') : '',
        age: 30,
        gender: '',
        passportNumber: '',
        nationality: '',
      })),
      contactEmail: user?.email ?? '',
      contactPhone: user?.phone ?? '',
      specialRequests: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'travellers' });

  // Someone deep-linking to /checkout without picking dates has nothing to book.
  useEffect(() => {
    const missingPackageState = bookingType === 'PACKAGE' && !state.departureDate;
    const missingHotelState = bookingType === 'HOTEL' && (!state.startDate || !state.roomId);

    if (missingPackageState || missingHotelState) {
      toast.info('Choose your dates first');
      navigate(bookingType === 'PACKAGE' ? `/packages/${slug}` : `/hotels/${slug}`, {
        replace: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    if (bookingType === 'PACKAGE' && pkg) {
      const start = state.departureDate ?? '';
      const end = start
        ? new Date(new Date(start).getTime() + (pkg.durationDays - 1) * 86_400_000)
            .toISOString()
            .slice(0, 10)
        : '';
      const unitPrice = state.unitPrice ?? pkg.effectivePrice;

      return {
        title: pkg.title,
        subtitle: `${pkg.destinationName}, ${pkg.destinationCountry}`,
        image: pkg.heroImageUrl,
        currency: pkg.currency,
        startDate: start,
        endDate: end,
        unitPrice,
        quantity: travellerCount,
        unitLabel: `${formatCurrency(unitPrice, pkg.currency)} × ${travellerCount} traveller${
          travellerCount === 1 ? '' : 's'
        }`,
        total: unitPrice * travellerCount,
        meta: `${pkg.durationDays} days / ${pkg.durationNights} nights`,
      };
    }

    if (bookingType === 'HOTEL' && hotel) {
      const start = state.startDate ?? '';
      const end = state.endDate ?? '';
      const nights = state.nights ?? Math.max(1, nightsBetween(start, end));
      const rooms = state.roomCount ?? 1;
      const unitPrice = state.unitPrice ?? hotel.pricePerNight;

      return {
        title: hotel.name,
        subtitle: `${hotel.city}, ${hotel.country}${state.roomType ? ` · ${state.roomType}` : ''}`,
        image: hotel.heroImageUrl,
        currency: hotel.currency,
        startDate: start,
        endDate: end,
        unitPrice,
        quantity: nights * rooms,
        unitLabel: `${formatCurrency(unitPrice, hotel.currency)} × ${nights} night${
          nights === 1 ? '' : 's'
        }${rooms > 1 ? ` × ${rooms} rooms` : ''}`,
        total: unitPrice * nights * rooms,
        meta: `${nights} night${nights === 1 ? '' : 's'} · ${rooms} room${rooms === 1 ? '' : 's'}`,
      };
    }

    return null;
  }, [bookingType, pkg, hotel, state, travellerCount]);

  const isLoading = pkgLoading || hotelLoading;

  // ----------------------------------------------------------- handlers

  const goToReview = async () => {
    const valid = await trigger();
    if (!valid) {
      toast.error('Check the highlighted fields');
      return;
    }
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmBooking = async () => {
    if (!summary) return;
    const values = getValues();

    const payload: CreateBookingRequest = {
      bookingType,
      itemSlug: slug,
      roomId: bookingType === 'HOTEL' ? (state.roomId ?? null) : null,
      startDate: summary.startDate,
      endDate: summary.endDate,
      travellerCount: values.travellers.length,
      roomCount: bookingType === 'HOTEL' ? (state.roomCount ?? 1) : null,
      travellers: values.travellers.map((traveller, index) => ({
        fullName: traveller.fullName,
        age: Number(traveller.age),
        gender: traveller.gender,
        passportNumber: traveller.passportNumber || undefined,
        nationality: traveller.nationality || undefined,
        leadTraveller: index === 0,
      })),
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone,
      specialRequests: values.specialRequests || undefined,
    };

    try {
      const booking = await createBooking(payload).unwrap();
      setBookingReference(booking.bookingReference);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.apiError(error, 'Could not create your booking');
    }
  };

  /**
   * Two ways to pay:
   * - RAZORPAY — an online UPI / BHIM payment: initiate the order, open the
   *   Razorpay widget, then verify the signed callback before confirming.
   * - CASH — pay at the hotel on arrival (hotels only): the single initiate call
   *   reserves the room server-side; there is nothing to capture online.
   */
  const payNow = async () => {
    if (!bookingReference) return;
    setIsPaying(true);

    if (method === 'CASH') {
      try {
        await initiatePayment({ bookingReference, method: 'CASH' }).unwrap();
        toast.success('Booking reserved', 'Pay in cash when you arrive at the hotel.');
        navigate(`/booking-confirmed/${bookingReference}`, { replace: true });
      } catch (error) {
        toast.apiError(error, 'Could not reserve your booking');
        setIsPaying(false);
      }
      return;
    }

    await payWithRazorpay({
      bookingReference,
      prefill: {
        name: getValues('travellers.0.fullName'),
        email: getValues('contactEmail'),
        contact: getValues('contactPhone'),
      },
      onSuccess: () => {
        toast.success('Payment successful', 'Your booking is confirmed.');
        navigate(`/booking-confirmed/${bookingReference}`, { replace: true });
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

  // -------------------------------------------------------------- render

  if (isLoading || !summary) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-56" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo title="Checkout" noIndex />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <BackLink
          fallbackTo={bookingType === 'PACKAGE' ? `/packages/${slug}` : `/hotels/${slug}`}
          className="mb-5"
        />

        <h1 className="text-3xl">Complete your booking</h1>

        {/* --------------------------------------------------- stepper */}
        <ol className="mt-6 flex items-center gap-2 sm:gap-4">
          {STEPS.map((label, index) => {
            const done = index < step;
            const active = index === step;

            return (
              <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors',
                    done
                      ? 'bg-emerald-500 text-white'
                      : active
                        ? 'bg-brand-600 text-white'
                        : 'bg-[var(--surface-muted)] text-[var(--text-muted)]',
                  )}
                >
                  {done ? <Check className="size-4" aria-hidden /> : index + 1}
                </span>
                <span
                  className={cn(
                    'hidden text-sm font-semibold sm:inline',
                    active ? 'text-[var(--text-strong)]' : 'text-[var(--text-muted)]',
                  )}
                >
                  {label}
                </span>
                {index < STEPS.length - 1 && (
                  <span
                    className={cn(
                      'h-0.5 flex-1 rounded-full transition-colors',
                      done ? 'bg-emerald-500' : 'bg-[var(--border-subtle)]',
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            {/* ------------------------------------ step 1: travellers */}
            {step === 0 && (
              <form onSubmit={handleSubmit(goToReview)} className="space-y-6" noValidate>
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-display text-lg font-semibold">Traveller details</h2>
                      <span className="text-muted inline-flex items-center gap-1.5 text-sm">
                        <Users className="size-4" aria-hidden />
                        {fields.length}
                      </span>
                    </div>

                    <div className="mt-5 space-y-6">
                      {fields.map((field, index) => (
                        <fieldset key={field.id} className="border-t pt-5 first:border-0 first:pt-0">
                          <legend className="mb-3 flex w-full items-center justify-between gap-3">
                            <span className="text-sm font-semibold">
                              {index === 0 ? 'Lead traveller' : `Traveller ${index + 1}`}
                            </span>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-muted inline-flex items-center gap-1 text-xs font-medium hover:text-rose-600"
                              >
                                <Trash2 className="size-3.5" aria-hidden />
                                Remove
                              </button>
                            )}
                          </legend>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                              {...register(`travellers.${index}.fullName`)}
                              label="Full name (as on ID)"
                              placeholder="Priya Sharma"
                              error={errors.travellers?.[index]?.fullName?.message}
                              required
                            />
                            <Input
                              {...register(`travellers.${index}.age`)}
                              type="number"
                              label="Age"
                              min={1}
                              max={120}
                              error={errors.travellers?.[index]?.age?.message}
                              required
                            />
                            <Select
                              {...register(`travellers.${index}.gender`)}
                              label="Gender"
                              error={errors.travellers?.[index]?.gender?.message}
                              required
                            >
                              <option value="">Select…</option>
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                              <option value="OTHER">Other</option>
                              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                            </Select>
                            <Input
                              {...register(`travellers.${index}.nationality`)}
                              label="Nationality"
                              placeholder="Indian"
                              error={errors.travellers?.[index]?.nationality?.message}
                            />
                            <Input
                              {...register(`travellers.${index}.passportNumber`)}
                              label="Passport number"
                              placeholder="Optional for domestic trips"
                              className="sm:col-span-2"
                              error={errors.travellers?.[index]?.passportNumber?.message}
                            />
                          </div>
                        </fieldset>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-5"
                      leftIcon={<UserPlus className="size-4" />}
                      onClick={() =>
                        append({
                          fullName: '',
                          age: 30,
                          gender: '',
                          passportNumber: '',
                          nationality: '',
                        })
                      }
                    >
                      Add traveller
                    </Button>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h2 className="font-display text-lg font-semibold">Contact details</h2>
                    <p className="text-muted mt-1 text-sm">
                      Booking confirmation and trip updates go here.
                    </p>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <Input
                        {...register('contactEmail')}
                        type="email"
                        label="Email address"
                        error={errors.contactEmail?.message}
                        required
                      />
                      <Input
                        {...register('contactPhone')}
                        type="tel"
                        label="Phone number"
                        placeholder="+91 98765 43210"
                        error={errors.contactPhone?.message}
                        required
                      />
                      <Textarea
                        {...register('specialRequests')}
                        label="Special requests"
                        placeholder="Dietary needs, accessibility, early check-in…"
                        className="sm:col-span-2"
                        error={errors.specialRequests?.message}
                      />
                    </div>
                  </CardBody>
                </Card>

                <Button type="submit" size="lg" fullWidth>
                  Continue to review
                </Button>
              </form>
            )}

            {/* ---------------------------------------- step 2: review */}
            {step === 1 && (
              <div className="space-y-6">
                <Card>
                  <CardBody>
                    <h2 className="font-display text-lg font-semibold">Review your travellers</h2>
                    <ul className="mt-4 divide-y">
                      {getValues('travellers').map((traveller, index) => (
                        <li key={index} className="flex items-center justify-between gap-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {traveller.fullName}
                              {index === 0 && (
                                <span className="text-muted ml-2 text-xs font-normal">(lead)</span>
                              )}
                            </p>
                            <p className="text-muted text-xs">
                              {traveller.age} yrs · {traveller.gender.replace(/_/g, ' ').toLowerCase()}
                              {traveller.nationality ? ` · ${traveller.nationality}` : ''}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 border-t pt-4 text-sm">
                      <p>
                        <span className="text-muted">Email:</span> {getValues('contactEmail')}
                      </p>
                      <p className="mt-1">
                        <span className="text-muted">Phone:</span> {getValues('contactPhone')}
                      </p>
                      {getValues('specialRequests') && (
                        <p className="mt-1">
                          <span className="text-muted">Requests:</span>{' '}
                          {getValues('specialRequests')}
                        </p>
                      )}
                    </div>
                  </CardBody>
                </Card>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="secondary" size="lg" onClick={() => setStep(0)} className="sm:flex-1">
                    Back to details
                  </Button>
                  <Button size="lg" loading={isCreating} onClick={confirmBooking} className="sm:flex-1">
                    Confirm & continue
                  </Button>
                </div>
              </div>
            )}

            {/* --------------------------------------- step 3: payment */}
            {step === 2 && (
              <div className="space-y-6">
                <Card>
                  <CardBody className="text-center">
                    <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <Check className="size-7" aria-hidden />
                    </span>
                    <h2 className="mt-4 font-display text-lg font-semibold">Booking reserved</h2>
                    <p className="text-muted mt-1.5 text-sm">
                      Reference{' '}
                      <span className="font-mono font-semibold text-[var(--text-strong)]">
                        {bookingReference}
                      </span>
                      . Complete payment to confirm your seats.
                    </p>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h2 className="font-display text-lg font-semibold">Payment</h2>
                    <p className="text-muted mt-1 text-sm">
                      {method === 'CASH' ? (
                        <>
                          Reserve now and pay{' '}
                          <span className="font-semibold text-[var(--text-strong)]">
                            {formatCurrency(summary.total, summary.currency)}
                          </span>{' '}
                          in cash at the hotel.
                        </>
                      ) : (
                        <>
                          You will be charged{' '}
                          <span className="font-semibold text-[var(--text-strong)]">
                            {formatCurrency(summary.total, summary.currency)}
                          </span>
                          .
                        </>
                      )}
                    </p>

                    <fieldset className="mt-5 space-y-3">
                      <legend className="sr-only">Choose a payment method</legend>

                      <label
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                          method === 'RAZORPAY'
                            ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/30'
                            : 'hover:border-[var(--border-strong)]',
                        )}
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          className="mt-1 size-4 shrink-0 accent-brand-600"
                          checked={method === 'RAZORPAY'}
                          onChange={() => setMethod('RAZORPAY')}
                        />
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 text-sm font-semibold">
                            <Smartphone className="size-4 text-brand-ink-soft" aria-hidden />
                            UPI / BHIM
                          </span>
                          <span className="text-muted mt-1 block text-xs leading-relaxed">
                            Pay instantly from any UPI app — BHIM, Google Pay, PhonePe, Paytm — or by
                            card and netbanking. Secured by Razorpay.
                          </span>
                        </span>
                      </label>

                      {bookingType === 'HOTEL' && (
                        <label
                          className={cn(
                            'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                            method === 'CASH'
                              ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/30'
                              : 'hover:border-[var(--border-strong)]',
                          )}
                        >
                          <input
                            type="radio"
                            name="payment-method"
                            className="mt-1 size-4 shrink-0 accent-brand-600"
                            checked={method === 'CASH'}
                            onChange={() => setMethod('CASH')}
                          />
                          <span className="min-w-0">
                            <span className="flex items-center gap-2 text-sm font-semibold">
                              <Banknote className="size-4 text-brand-ink-soft" aria-hidden />
                              Pay at hotel — cash on arrival
                            </span>
                            <span className="text-muted mt-1 block text-xs leading-relaxed">
                              Reserve your room now and pay in cash when you check in. No online
                              payment needed.
                            </span>
                          </span>
                        </label>
                      )}
                    </fieldset>

                    <Button
                      size="lg"
                      fullWidth
                      className="mt-5"
                      loading={isInitiating || isPaying}
                      onClick={payNow}
                      leftIcon={
                        method === 'CASH' ? <Banknote className="size-4" /> : <Lock className="size-4" />
                      }
                    >
                      {method === 'CASH'
                        ? 'Reserve — pay at the hotel'
                        : `Pay ${formatCurrency(summary.total, summary.currency)}`}
                    </Button>

                    <p className="text-muted mt-3 flex items-center justify-center gap-1.5 text-xs">
                      <ShieldCheck className="size-3.5" aria-hidden />
                      {method === 'CASH'
                        ? 'Your room is held the moment you reserve'
                        : 'Payments are encrypted — your details never touch GoTour servers'}
                    </p>
                  </CardBody>
                </Card>
              </div>
            )}
          </div>

          {/* ------------------------------------------- order summary */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <Card>
              <CardBody>
                <h2 className="font-display text-lg font-semibold">Order summary</h2>

                <div className="mt-4 flex gap-3">
                  <SmartImage
                    src={summary.image}
                    alt={summary.title}
                    wrapperClassName="size-20 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-2-safe text-sm font-semibold">{summary.title}</p>
                    <p className="text-muted mt-0.5 truncate text-xs">{summary.subtitle}</p>
                    <p className="text-muted mt-1 text-xs">{summary.meta}</p>
                  </div>
                </div>

                {summary.startDate && summary.endDate && (
                  <p className="text-muted mt-4 flex items-center gap-2 rounded-xl bg-[var(--surface-muted)] p-3 text-xs">
                    <CalendarDays className="size-4 shrink-0" aria-hidden />
                    {formatDateRange(summary.startDate, summary.endDate)}
                  </p>
                )}

                <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">{summary.unitLabel}</dt>
                    <dd className="shrink-0 font-medium">
                      {formatCurrency(summary.total, summary.currency)}
                    </dd>
                  </div>
                  <div className="text-muted flex justify-between">
                    <dt>Taxes & fees</dt>
                    <dd>Included</dd>
                  </div>
                  <div className="flex justify-between border-t pt-2.5 text-base font-bold">
                    <dt>Total</dt>
                    <dd className="text-brand-ink">
                      {formatCurrency(summary.total, summary.currency)}
                    </dd>
                  </div>
                </dl>
              </CardBody>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
