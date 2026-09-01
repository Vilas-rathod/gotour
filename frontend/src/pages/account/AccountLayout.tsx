import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ACCOUNT_NAV } from '@/components/layout/navigation';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { RouteFallback } from '@/components/common/RouteFallback';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { formatDate, initialsOf } from '@/lib/format';
import { Bell } from 'lucide-react';

const NAV_WITH_NOTIFICATIONS = [
  ...ACCOUNT_NAV,
  { label: 'Notifications', to: '/account/notifications', icon: Bell },
];

export function AccountLayout() {
  const { user } = useAuth();

  return (
    <div className="shell section-tight">
      <header className="surface-card flex flex-wrap items-center gap-4 rounded-3xl p-5 sm:p-6">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-lg font-bold text-white">
          {initialsOf(user?.fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl">{user?.fullName ?? 'My account'}</h1>
          <p className="text-muted truncate text-sm">{user?.email}</p>
          {user?.createdAt && (
            <p className="text-muted mt-0.5 text-xs">Member since {formatDate(user.createdAt)}</p>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Horizontal scroller on mobile, vertical rail from `lg`. */}
        <nav aria-label="Account sections">
          <ul className="flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:sticky lg:top-24 lg:flex-col lg:gap-1 lg:overflow-visible">
            {NAV_WITH_NOTIFICATIONS.map((item) => (
              <li key={item.to} className="shrink-0 lg:w-full">
                <NavLink
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    cn(
                      'inline-flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                      isActive
                        ? 'bg-linear-to-b from-brand-600 to-brand-800 text-white shadow-[0_1px_0_0_oklch(1_0_0/0.2)_inset,0_8px_18px_-8px_oklch(0.352_0.062_197/0.7)] dark:from-brand-300 dark:to-brand-500 dark:text-brand-950'
                        : 'hover:bg-[var(--surface-muted)]',
                    )
                  }
                >
                  <item.icon className="size-4 shrink-0" aria-hidden />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <ErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
