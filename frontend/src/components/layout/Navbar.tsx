import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { mobileMenuToggled } from '@/features/ui/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadNotificationCountQuery } from '@/features/notifications/notificationsApi';
import { useWishlistCountQuery } from '@/features/wishlist/wishlistApi';
import { cn } from '@/lib/utils';
import { initialsOf } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { ACCOUNT_NAV, MEGA_MENU } from './navigation';
import { SmartImage } from '@/components/common/SmartImage';

/** Small pill counter used on the bell and heart icons. */
function CountBubble({ count }: { count: number }) {
  // Coerce defensively: rendering a non-number child here would white-screen
  // the whole authenticated shell, so never trust the incoming value blindly.
  const n = typeof count === 'number' && Number.isFinite(count) ? count : 0;
  if (n <= 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 grid min-w-4.5 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
      {n > 99 ? '99+' : n}
    </span>
  );
}

/**
 * The dropdown is anchored to the header's content container, not to the nav
 * item that opened it. Anchoring to the trigger and centring a ~64rem panel on
 * it pushed the panel off the left edge of the viewport, because "Destinations"
 * sits only ~200px from the left. Spanning the container instead means the
 * panel can never overflow, at any width.
 */
function MegaMenuPanel({ section }: { section: (typeof MEGA_MENU)[number] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.16 }}
      className="glass-strong mt-2 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-3xl p-7 shadow-lift"
    >
      <div
        className={cn(
          'grid gap-8',
          section.feature ? 'lg:grid-cols-[1fr_1fr_260px]' : 'lg:grid-cols-2',
        )}
      >
        {section.columns.map((column) => (
          <div key={column.heading}>
            <p className="mb-3.5 flex items-center gap-2.5 text-[11px] font-bold tracking-[0.18em] text-brand-ink uppercase">
              {column.heading}
              <span className="h-px flex-1 bg-linear-to-r from-gold-500/45 to-transparent" aria-hidden />
            </p>
            <ul className="space-y-1">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[var(--surface-muted)]"
                  >
                    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-brand-50 to-brand-100 text-brand-700 ring-1 ring-brand-600/10 transition-all group-hover:from-gold-100 group-hover:to-gold-200 group-hover:text-brand-800 dark:from-brand-950 dark:to-brand-900 dark:text-brand-300 dark:ring-brand-400/15 dark:group-hover:from-gold-700/40 dark:group-hover:to-gold-600/30 dark:group-hover:text-gold-200">
                      <link.icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{link.label}</span>
                      <span className="text-muted block text-xs">{link.description}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {section.feature && (
          <Link
            to={section.feature.to}
            className="group relative hidden overflow-hidden rounded-2xl ring-1 ring-black/5 transition-shadow hover:elev-3 lg:block dark:ring-white/10"
          >
            <SmartImage
              src={section.feature.imageUrl}
              alt=""
              wrapperClassName="absolute inset-0"
              className="transition-transform duration-700 group-hover:scale-105"
            />
            <div className="card-scrim absolute inset-0" />
            <div className="relative flex h-full min-h-56 flex-col justify-end p-5 text-white">
              <p className="font-display text-lg font-semibold">{section.feature.title}</p>
              <p className="mt-1 text-xs text-white/85">{section.feature.description}</p>
            </div>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Pages that render an image banner pulled up under the navbar. Kept as exact
 * paths so `/packages` qualifies but `/packages/bali` (a detail page with
 * ordinary content at the top) does not.
 */
const FULL_BLEED_ROUTES = new Set(['/', '/destinations', '/packages', '/hotels']);

export function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  const { data: unread = 0 } = useUnreadNotificationCountQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 60_000,
  });
  const { data: savedCount = 0 } = useWishlistCountQuery(undefined, { skip: !isAuthenticated });

  /**
   * Routes whose first element is a full-bleed banner that deliberately runs
   * underneath the navbar. Only these may use the transparent treatment — on
   * any other route the bar sits on the page background, where light-on-light
   * type would be invisible.
   */
  const overHero = FULL_BLEED_ROUTES.has(location.pathname) && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close transient menus whenever the route changes.
  useEffect(() => {
    setOpenMenu(null);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [accountOpen]);

  // Hover intent: a short delay stops the panel flickering between items.
  const openWithIntent = (label: string) => {
    window.clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const closeWithIntent = () => {
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 140);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-90 transition-all duration-300',
        overHero ? 'bg-transparent' : 'glass border-b border-[var(--border-subtle)] elev-1',
      )}
    >
      {/*
        Over a hero the bar has no surface of its own, so legibility depends on
        whatever the photo happens to be. A bright sky would wash out white type
        entirely. This top-down scrim guarantees contrast for the nav regardless
        of the image, and fades out before it reads as a band.
      */}
      {overHero && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 via-black/25 to-transparent"
          aria-hidden
        />
      )}

      <div className="shell relative z-10 flex h-16 items-center gap-3 lg:h-18">
        <Logo onLight={overHero} />

        {/* ---------------------------------------------- desktop nav */}
        <nav
          className="ml-6 hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
          onMouseLeave={closeWithIntent}
        >
          {MEGA_MENU.map((section) => (
            <NavLink
              key={section.label}
              to={section.to}
              onMouseEnter={() => openWithIntent(section.label)}
              onFocus={() => openWithIntent(section.label)}
              className={({ isActive }) =>
                cn(
                  'relative inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors',
                  'after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-gold-500 after:transition-transform after:duration-300',
                  overHero
                    ? 'text-white/90 hover:bg-white/15 hover:text-white'
                    : 'hover:bg-[var(--surface-muted)]',
                  isActive && 'after:scale-x-100',
                  isActive && !overHero && 'text-brand-ink',
                  isActive && overHero && 'text-white',
                )
              }
              aria-expanded={openMenu === section.label}
            >
              {section.label}
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform',
                  openMenu === section.label && 'rotate-180',
                )}
                aria-hidden
              />
            </NavLink>
          ))}

          <NavLink
            to="/search"
            onMouseEnter={() => setOpenMenu(null)}
            className={({ isActive }) =>
              cn(
                'rounded-full px-3.5 py-2 text-sm font-semibold transition-colors',
                overHero
                  ? 'text-white/90 hover:bg-white/15 hover:text-white'
                  : 'hover:bg-[var(--surface-muted)]',
                isActive && !overHero && 'text-brand-ink',
              )
            }
          >
            Search
          </NavLink>
        </nav>

        {/* One panel for the whole bar, anchored to this container so it can
            never spill past the viewport edge. */}
        <AnimatePresence>
          {openMenu && (
            <div
              className="absolute inset-x-4 top-full hidden lg:block"
              onMouseEnter={() => openWithIntent(openMenu)}
              onMouseLeave={closeWithIntent}
            >
              <MegaMenuPanel
                section={MEGA_MENU.find((section) => section.label === openMenu) ?? MEGA_MENU[0]}
              />
            </div>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        {/* ------------------------------------------------- actions */}
        <div className={cn('flex items-center gap-1', overHero && 'text-white')}>
          <Link
            to="/search"
            aria-label="Search GoTour"
            className={cn(
              'grid size-10 place-items-center rounded-full transition-colors lg:hidden',
              overHero ? 'hover:bg-white/15' : 'hover:bg-[var(--surface-muted)]',
            )}
          >
            <Search className="size-5" />
          </Link>

          <ThemeToggle onLight={overHero} className="mx-1 hidden sm:inline-flex" />

          {isAuthenticated && (
            <>
              <Link
                to="/account/wishlist"
                aria-label={`Wishlist, ${savedCount} saved`}
                className={cn(
                  'relative hidden size-10 place-items-center rounded-full transition-colors sm:grid',
                  overHero ? 'hover:bg-white/15' : 'hover:bg-[var(--surface-muted)]',
                )}
              >
                <Heart className="size-5" />
                <CountBubble count={savedCount} />
              </Link>

              <Link
                to="/account/notifications"
                aria-label={`Notifications, ${unread} unread`}
                className={cn(
                  'relative grid size-10 place-items-center rounded-full transition-colors',
                  overHero ? 'hover:bg-white/15' : 'hover:bg-[var(--surface-muted)]',
                )}
              >
                <Bell className="size-5" />
                <CountBubble count={unread} />
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="relative ml-1 hidden lg:block" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className={cn(
                  'flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors',
                  overHero ? 'hover:bg-white/15' : 'hover:bg-[var(--surface-muted)]',
                )}
              >
                <span className="grid size-8 place-items-center rounded-full bg-linear-to-br from-brand-500 to-brand-700 text-xs font-bold text-white ring-1 ring-white/20">
                  {initialsOf(user?.fullName)}
                </span>
                <ChevronDown className={cn('size-4 transition-transform', accountOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="glass-strong absolute right-0 mt-2 w-64 origin-top-right rounded-2xl p-2 shadow-lift"
                  >
                    <div className="border-b px-3 pt-1 pb-2.5">
                      <p className="truncate text-sm font-semibold">{user?.fullName}</p>
                      <p className="text-muted truncate text-xs">{user?.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        role="menuitem"
                        className="mt-1.5 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-[var(--surface-muted)] dark:text-brand-300"
                      >
                        <LayoutDashboard className="size-4" aria-hidden />
                        Admin dashboard
                      </Link>
                    )}

                    {ACCOUNT_NAV.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--surface-muted)]"
                      >
                        <item.icon className="size-4" aria-hidden />
                        {item.label}
                      </Link>
                    ))}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2.5 rounded-xl border-t px-3 py-2 pt-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      <LogOut className="size-4" aria-hidden />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="ml-2 hidden items-center gap-2 lg:flex">
              <Button
                variant={overHero ? 'glass' : 'ghost'}
                size="sm"
                onClick={() => navigate('/login')}
                leftIcon={<User className="size-4" />}
              >
                Sign in
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Get started
              </Button>
            </div>
          )}

          <button
            type="button"
            onClick={() => dispatch(mobileMenuToggled(true))}
            aria-label="Open menu"
            className={cn(
              'grid size-10 place-items-center rounded-full transition-colors lg:hidden',
              overHero ? 'hover:bg-white/15' : 'hover:bg-[var(--surface-muted)]',
            )}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
