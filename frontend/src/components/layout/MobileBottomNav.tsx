import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MOBILE_TABS } from './navigation';

/** App-style tab bar shown below the `lg` breakpoint. */
export function MobileBottomNav() {
  return (
    <nav
      className="glass-strong fixed inset-x-0 bottom-0 z-90 border-t pb-safe lg:hidden"
      aria-label="Primary"
    >
      <ul className="flex items-stretch">
        {MOBILE_TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors',
                  isActive ? 'text-brand-ink-soft' : 'text-[var(--text-muted)]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid size-9 place-items-center rounded-xl transition-all duration-200',
                      isActive &&
                        'bg-linear-to-br from-brand-50 to-brand-100 ring-1 ring-brand-600/12 dark:from-brand-950 dark:to-brand-900 dark:ring-brand-400/18',
                    )}
                  >
                    <tab.icon className="size-5" aria-hidden />
                  </span>
                  {tab.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
