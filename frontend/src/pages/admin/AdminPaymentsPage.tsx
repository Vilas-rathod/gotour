import { CreditCard, Search, Undo2 } from 'lucide-react';
import { useState } from 'react';
import {
  useAdminPaymentsQuery,
  useAdminRevenueStatsQuery,
  useRefundPaymentMutation,
} from '@/features/payments/paymentsApi';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatTile } from '@/components/admin/StatTile';
import { PaymentStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Seo } from '@/components/common/Seo';
import { useToast } from '@/hooks/useToast';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatCurrency, formatDateTime, humanizeEnum } from '@/lib/format';
import type { Payment, PaymentStatus } from '@/types/api';
import { CircleDollarSign, TrendingDown, TrendingUp } from 'lucide-react';

const STATUSES: PaymentStatus[] = [
  'CREATED',
  'PENDING',
  'SUCCESS',
  'FAILED',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
];

export default function AdminPaymentsPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebouncedValue(search, 400);

  const { data: stats, isLoading: statsLoading } = useAdminRevenueStatsQuery();
  const { data, isLoading } = useAdminPaymentsQuery({
    search: debouncedSearch || undefined,
    status: status || undefined,
    page,
    size: 12,
  });

  const [refundPayment, { isLoading: isRefunding }] = useRefundPaymentMutation();

  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const openRefund = (payment: Payment) => {
    const alreadyRefunded = payment.refundedAmount ?? 0;
    setRefundTarget(payment);
    setRefundAmount(String(Math.max(0, payment.amount - alreadyRefunded)));
    setRefundReason('');
  };

  const handleRefund = async () => {
    if (!refundTarget) return;

    const amount = Number(refundAmount);
    const refundable = refundTarget.amount - (refundTarget.refundedAmount ?? 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid refund amount');
      return;
    }
    if (amount > refundable) {
      toast.error(`Maximum refundable is ${formatCurrency(refundable, refundTarget.currency)}`);
      return;
    }
    if (refundReason.trim().length < 5) {
      toast.error('Enter a refund reason');
      return;
    }

    try {
      await refundPayment({
        paymentReference: refundTarget.paymentReference,
        amount,
        reason: refundReason.trim(),
      }).unwrap();
      toast.success('Refund issued', formatCurrency(amount, refundTarget.currency));
      setRefundTarget(null);
    } catch (error) {
      toast.apiError(error, 'Could not issue the refund');
    }
  };

  const columns: Column<Payment>[] = [
    {
      key: 'reference',
      header: 'Payment',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold">{row.paymentReference}</p>
          <p className="text-muted mt-0.5 font-mono text-xs">{row.bookingReference}</p>
        </div>
      ),
    },
    {
      key: 'provider',
      header: 'Provider',
      hideBelow: 'md',
      render: (row) => (
        <div className="min-w-0">
          <p className="text-sm capitalize">{row.provider.toLowerCase()}</p>
          {row.method && <p className="text-muted text-xs">{row.method}</p>}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => (
        <div>
          <p className="text-sm font-semibold tabular-nums">
            {formatCurrency(row.amount, row.currency)}
          </p>
          {row.refundedAmount !== null && row.refundedAmount > 0 && (
            <p className="text-muted text-xs tabular-nums">
              −{formatCurrency(row.refundedAmount, row.currency)} refunded
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <div>
          <PaymentStatusBadge status={row.status} />
          {row.failureReason && (
            <p className="text-muted mt-1 max-w-40 truncate text-xs">{row.failureReason}</p>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      hideBelow: 'lg',
      render: (row) => (
        <span className="text-muted text-xs">
          {formatDateTime(row.paidAt ?? row.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => {
        const refundable = row.amount - (row.refundedAmount ?? 0);
        const canRefund =
          (row.status === 'SUCCESS' || row.status === 'PARTIALLY_REFUNDED') && refundable > 0;

        return canRefund ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openRefund(row)}
            leftIcon={<Undo2 className="size-4" />}
          >
            Refund
          </Button>
        ) : null;
      },
    },
  ];

  return (
    <>
      <Seo title="Payments & refunds" noIndex />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl">Payments</h1>
        <p className="text-muted mt-1 text-sm">Transactions, refunds and revenue.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={CircleDollarSign}
          label="Gross revenue"
          value={formatCurrency(stats?.grossRevenue ?? 0, 'INR')}
          loading={statsLoading}
          tone="success"
        />
        <StatTile
          icon={TrendingDown}
          label="Refunded"
          value={formatCurrency(stats?.refunded ?? 0, 'INR')}
          loading={statsLoading}
          tone="warning"
        />
        <StatTile
          icon={TrendingUp}
          label="Net revenue"
          value={formatCurrency(stats?.netRevenue ?? 0, 'INR')}
          loading={statsLoading}
        />
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_200px]">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          placeholder="Payment or booking reference"
          leftIcon={<Search className="size-4" />}
          aria-label="Search payments"
        />
        <Select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as PaymentStatus | '');
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
      </div>

      <DataTable
        caption="All GoTour payments"
        columns={columns}
        rows={data?.content ?? []}
        getRowKey={(row) => row.paymentReference}
        loading={isLoading}
        emptyState={
          <EmptyState
            icon={CreditCard}
            title="No payments found"
            description="Transactions appear here as customers complete checkout."
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
        open={refundTarget !== null}
        onClose={() => setRefundTarget(null)}
        title="Issue a refund"
        description={
          refundTarget
            ? `${refundTarget.paymentReference} · ${formatCurrency(
                refundTarget.amount,
                refundTarget.currency,
              )} charged`
            : undefined
        }
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRefundTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={isRefunding} onClick={handleRefund}>
              Issue refund
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            type="number"
            label="Refund amount"
            value={refundAmount}
            onChange={(event) => setRefundAmount(event.target.value)}
            min={1}
            max={refundTarget ? refundTarget.amount - (refundTarget.refundedAmount ?? 0) : undefined}
            hint={
              refundTarget
                ? `Maximum ${formatCurrency(
                    refundTarget.amount - (refundTarget.refundedAmount ?? 0),
                    refundTarget.currency,
                  )}`
                : undefined
            }
            required
          />
          <Textarea
            label="Reason"
            value={refundReason}
            onChange={(event) => setRefundReason(event.target.value)}
            placeholder="Customer cancelled within the free window, service not delivered, etc."
            required
          />
        </div>
      </Modal>
    </>
  );
}
