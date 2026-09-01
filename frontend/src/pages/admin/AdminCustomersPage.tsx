import { CalendarPlus, Search, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { useAdminCustomerGrowthQuery, useAdminUsersQuery } from '@/features/profile/profileApi';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatTile } from '@/components/admin/StatTile';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Seo } from '@/components/common/Seo';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatDate, formatNumber, initialsOf } from '@/lib/format';
import type { AdminUser } from '@/types/api';

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data: growth, isLoading: growthLoading } = useAdminCustomerGrowthQuery();
  const { data, isLoading } = useAdminUsersQuery({
    search: debouncedSearch || undefined,
    page,
    size: 12,
  });

  const columns: Column<AdminUser>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
            {initialsOf(row.fullName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.fullName}</p>
            <p className="text-muted truncate text-xs">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      hideBelow: 'md',
      render: (row) => <span className="text-muted text-sm">{row.phone ?? '—'}</span>,
    },
    {
      key: 'nationality',
      header: 'Nationality',
      hideBelow: 'lg',
      render: (row) => <span className="text-muted text-sm">{row.nationality ?? '—'}</span>,
    },
    {
      key: 'joined',
      header: 'Joined',
      align: 'right',
      render: (row) => <span className="text-muted text-sm">{formatDate(row.joinedAt)}</span>,
    },
  ];

  return (
    <>
      <Seo title="Customers" noIndex />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl">Customers</h1>
        <p className="text-muted mt-1 text-sm">Registered GoTour travellers.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={Users}
          label="Total customers"
          value={formatNumber(growth?.totalCustomers ?? 0)}
          loading={growthLoading}
        />
        <StatTile
          icon={UserPlus}
          label="New this week"
          value={formatNumber(growth?.newLast7Days ?? 0)}
          loading={growthLoading}
          tone="success"
        />
        <StatTile
          icon={CalendarPlus}
          label="New in 30 days"
          value={formatNumber(growth?.newLast30Days ?? 0)}
          loading={growthLoading}
        />
      </div>

      <div className="mb-5 max-w-md">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          placeholder="Search by name or email"
          leftIcon={<Search className="size-4" />}
          aria-label="Search customers"
        />
      </div>

      <DataTable
        caption="Registered GoTour customers"
        columns={columns}
        rows={data?.content ?? []}
        getRowKey={(row) => row.id}
        loading={isLoading}
        emptyState={
          <EmptyState
            icon={Users}
            title="No customers found"
            description="Try a different search term."
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
    </>
  );
}
