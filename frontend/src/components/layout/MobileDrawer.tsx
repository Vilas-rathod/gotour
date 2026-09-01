import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LayoutDashboard, LogOut, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { mobileMenuToggled } from '@/features/ui/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { initialsOf } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { ACCOUNT_NAV, MEGA_MENU } from './navigation';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

export function MobileDrawer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const open = useAppSelector((state) => state.ui.mobileMenuOpen);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(MEGA_MENU[0]?.label ?? null);

  const close = () => dispatch(mobileMenuToggled(false));

  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleLogout = async () => {
    await logout();
    close();
    navigate('/');
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-100 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            aria-hidden
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col border-l border-[var(--border-subtle)] bg-[var(--surface-raised)] shadow-lift"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b px-4 py-3.5">
              <Logo />
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="text-muted rounded-full p-2 transition-colors hover:bg-[var(--surface-muted)]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {isAuthenticated && (
                <Link
                  to="/account/profile"
                  className="mb-4 flex items-center gap-3 rounded-2xl bg-[var(--surface-muted)] p-3"
                >
                  <span className="grid size-11 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {initialsOf(user?.fullName)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{user?.fullName}</span>
                    <span className="text-muted block truncate text-xs">{user?.email}</span>
                  </span>
                </Link>
              )}

              <nav aria-label="Browse">
                {MEGA_MENU.map((section) => {
                  const isOpen = expanded === section.label;
                  return (
                    <div key={section.label} className="border-b last:border-0">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : section.label)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between py-3.5 text-left text-sm font-semibold"
                      >
                        {section.label}
                        <ChevronDown
                          className={cn('size-4 transition-transform', isOpen && 'rotate-180')}
                          aria-hidden
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="overflow-hidden"
                          >
                            <div className="pb-3">
                              {section.columns.flatMap((column) => column.links).map((link) => (
                                <Link
                                  key={link.to}
                                  to={link.to}
                                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm transition-colors hover:bg-[var(--surface-muted)]"
                                >
                                  <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
                                    <link.icon className="size-4" aria-hidden />
                                  </span>
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>

              {isAuthenticated && (
                <nav className="mt-4 border-t pt-4" aria-label="Account">
                  <p className="text-muted mb-2 text-xs font-bold tracking-[0.14em] uppercase">
                    My account
                  </p>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-[var(--surface-muted)] dark:text-brand-300"
                    >
                      <LayoutDashboard className="size-4" aria-hidden />
                      Admin dashboard
                    </Link>
                  )}
                  {ACCOUNT_NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--surface-muted)]"
                    >
                      <item.icon className="size-4" aria-hidden />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              )}
            </div>

            <div className="space-y-3 border-t p-4 pb-safe">
              <div className="flex items-center justify-between rounded-2xl bg-[var(--surface-muted)] px-3.5 py-2.5">
                <span className="text-sm font-semibold">Appearance</span>
                <ThemeToggle />
              </div>

              {isAuthenticated ? (
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleLogout}
                  leftIcon={<LogOut className="size-4" />}
                >
                  Sign out
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Button variant="secondary" onClick={() => navigate('/login')}>
                    Sign in
                  </Button>
                  <Button onClick={() => navigate('/register')}>Get started</Button>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
