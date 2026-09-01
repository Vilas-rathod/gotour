import { ArrowLeft } from 'lucide-react';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface BackLinkProps {
  /**
   * Where to go when there is no in-app history to pop — a deep link, a new
   * tab, or a page opened straight from a shared URL.
   */
  fallbackTo: string;
  label?: string;
  className?: string;
}

/**
 * Back control that behaves the way users expect in a real app: it returns to
 * the *previous page they were on*, preserving that page's scroll position and
 * filter state. Only when there is no history to return to does it fall back to
 * a sensible parent route.
 *
 * A plain `<Link to="/packages">` would instead discard the user's filters and
 * send them to the top of an unfiltered list — the usual reason "back" feels
 * broken on SPA product pages.
 */
export function BackLink({ fallbackTo, label = 'Back', className }: BackLinkProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = useCallback(() => {
    // `idx` is React Router's position in its own history stack. 0 means this
    // entry is the first one we created, so there is nothing of ours to pop.
    const historyIndex = (location as { idx?: number }).idx ?? window.history.state?.idx ?? 0;

    if (historyIndex > 0) {
      navigate(-1);
    } else {
      navigate(fallbackTo, { replace: true });
    }
  }, [navigate, location, fallbackTo]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'text-muted -ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--surface-muted)] hover:text-brand-ink',
        className,
      )}
    >
      <ArrowLeft className="size-4" aria-hidden />
      {label}
    </button>
  );
}
