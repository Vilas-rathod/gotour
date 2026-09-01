import { Suspense, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { ADMIN_NAV } from '@/components/layout/navigation';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { RouteFallback } from '@/components/common/RouteFallback';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { initialsOf } from '@/lib/format';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Standalone admin shell — deliberately separate from the storefront layout so
 * the two can diverge without either constraining the other.
 */
export function AdminLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = (
    <nav aria-label="Admin sections" className="space-y-1">
      {ADMIN_NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/admin'}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-linear-to-b from-brand-600 to-brand-800 text-white shadow-[0_1px_0_0_oklch(1_0_0/0.2)_inset,0_8px_18px_-8px_oklch(0.352_0.062_197/0.7)] dark:from-brand-300 dark:to-brand-500 dark:text-brand-950'
                : 'hover:bg-[var(--surface-muted)]',
            )
          }
        >
          <item.icon className="size-4 shrink-0" aria-hidden />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-[var(--surface-muted)]">
      {/* ----------------------------------------------------- top bar */}
      <header className="glass sticky top-0 z-90 border-b">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open admin menu"
            className="grid size-10 place-items-center rounded-full transition-colors hover:bg-[var(--surface-muted)] lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <Logo />
          <span className="hidden rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold tracking-wider text-white uppercase sm:inline">
            Admin
          </span>

          <div className="flex-1" />

          <Link
            to="/"
            className="text-muted hidden items-center gap-1.5 text-sm font-medium transition-colors hover:text-brand-700 sm:inline-flex dark:hover:text-brand-400"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to site
          </Link>

          <ThemeToggle />

          <span
            className="grid size-9 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white"
            title={user?.email}
          >
            {initialsOf(user?.fullName)}
          </span>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-8 px-4 py-8 sm:px-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">{nav}</div>
        </aside>

        <main className="min-w-0 flex-1">
          <ErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* -------------------------------------------------- mobile nav */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-100 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation"
              className="surface-card absolute inset-y-0 left-0 w-72 p-4 shadow-lift"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="mb-5 flex items-center justify-between">
                <Logo />
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close menu"
                  className="text-muted rounded-full p-2 transition-colors hover:bg-[var(--surface-muted)]"
                >
                  <X className="size-5" />
                </button>
              </div>
              {nav}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
