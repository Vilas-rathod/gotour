import { Search, Ticket, XCircle } from 'lucide-react';
import { useState } from 'react';
import {
  useAdminBookingsQuery,
  useAdminCancelBookingMutation,
  useAdminUpdateBookingStatusMutation,
} from '@/features/bookings/bookingsApi';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Badge, BookingStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Seo } from '@/components/common/Seo';
import { useToast } from '@/hooks/useToast';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatCurrency, formatDate, formatDateRange, humanizeEnum } from '@/lib/format';
import type { BookingStatus, BookingSummary, BookingType } from '@/types/api';

const STATUSES: BookingStatus[] = ['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
const TYPES: BookingType[] = ['PACKAGE', 'HOTEL'];

export default function AdminBookingsPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BookingStatus | ''>('');
  const [type, setType] = useState<BookingType | ''>('');
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading } = useAdminBookingsQuery({
    search: debouncedSearch || undefined,
    status: status || undefined,
    type: type || undefined,
    page,
    size: 12,
  });

  const [updateStatus] = useAdminUpdateBookingStatusMutation();
  const [cancelBooking, { isLoading: isCancelling }] = useAdminCancelBookingMutation();

  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const handleStatusChange = async (reference: string, next: BookingStatus) => {
    try {
      await updateStatus({ reference, status: next }).unwrap();
      toast.success('Booking updated', `${reference} → ${humanizeEnum(next)}`);
    } catch (error) {
      toast.apiError(error, 'Could not update the booking');
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    if (reason.trim().length < 5) {
      toast.error('Enter a cancellation reason');
      return;
    }
    try {
      await cancelBooking({ reference: cancelTarget, reason: reason.trim() }).unwrap();
      toast.success('Booking cancelled');
      setCancelTarget(null);
      setReason('');
    } catch (error) {
      toast.apiError(error, 'Could not cancel the booking');
    }
  };

  const columns: Column<BookingSummary>[] = [
    {
      key: 'reference',
      header: 'Reference',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold">{row.bookingReference}</p>
          <p className="text-muted mt-0.5 truncate text-xs">{formatDate(row.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'item',
      header: 'Booking',
      render: (row) => (
        <div className="min-w-0 max-w-56">
          <p className="truncate text-sm font-medium">{row.itemTitle}</p>
          <p className="text-muted mt-0.5 truncate text-xs">
            {humanizeEnum(row.bookingType)}
            {row.destinationName ? ` · ${row.destinationName}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Travel dates',
      hideBelow: 'lg',
      render: (row) => (
        <span className="text-muted text-xs">{formatDateRange(row.startDate, row.endDate)}</span>
      ),
    },
    {
      key: 'travellers',
      header: 'Pax',
      hideBelow: 'md',
      align: 'right',
      render: (row) => <span className="text-sm tabular-nums">{row.travellerCount}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => (
        <div>
          <p className="text-sm font-semibold tabular-nums">
            {formatCurrency(row.totalAmount, row.currency)}
          </p>
          <Badge
            variant={row.paymentStatus === 'PAID' ? 'success' : 'warning'}
            size="sm"
            className="mt-1"
          >
            {humanizeEnum(row.paymentStatus)}
          </Badge>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <div className="flex flex-col items-start gap-1.5">
          <BookingStatusBadge status={row.status} />
          {row.status !== 'CANCELLED' && (
            <select
              value={row.status}
              onChange={(event) =>
                handleStatusChange(row.bookingReference, event.target.value as BookingStatus)
              }
              aria-label={`Change status of ${row.bookingReference}`}
              className="h-8 rounded-lg border bg-transparent px-2 text-xs outline-none focus:border-brand-500"
            >
              {STATUSES.filter((value) => value !== 'CANCELLED').map((value) => (
                <option key={value} value={value}>
                  {humanizeEnum(value)}
                </option>
              ))}
            </select>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) =>
        row.status !== 'CANCELLED' ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Cancel ${row.bookingReference}`}
            className="text-muted hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
            onClick={() => setCancelTarget(row.bookingReference)}
          >
            <XCircle className="size-4" />
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <Seo title="Manage bookings" noIndex />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl">Bookings</h1>
        <p className="text-muted mt-1 text-sm">
          {data ? `${data.totalElements} bookings` : 'Loading…'}
        </p>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_180px_180px]">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          placeholder="Reference, customer email or trip"
          leftIcon={<Search className="size-4" />}
          aria-label="Search bookings"
        />
        <Select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as BookingStatus | '');
            setPage(0);
          }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {humanizeEnum(value)}
            </option>
          ))}
        </Select>
        <Select
          value={type}
          onChange={(event) => {
            setType(event.target.value as BookingType | '');
            setPage(0);
          }}
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          {TYPES.map((value) => (
            <option key={value} value={value}>
              {humanizeEnum(value)}
            </option>
          ))}
        </Select>
      </div>

      <DataTable
        caption="All GoTour bookings"
        columns={columns}
        rows={data?.content ?? []}
        getRowKey={(row) => row.bookingReference}
        loading={isLoading}
        emptyState={
          <EmptyState
            icon={Ticket}
            title="No bookings found"
            description="Try clearing the filters or searching a different reference."
          />
        }
      />

      {data && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onPageChange={setPage}
          className="mt-8"
        />
      )}

      <Modal
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        title="Cancel this booking?"
        description="The customer is notified and any refund follows the booking policy."
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>
              Keep booking
            </Button>
            <Button variant="danger" loading={isCancelling} onClick={handleCancel}>
              Cancel booking
            </Button>
          </div>
        }
      >
        <Textarea
          label="Reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Operator cancelled the departure, customer request, etc."
          required
        />
      </Modal>
    </>
  );
}
