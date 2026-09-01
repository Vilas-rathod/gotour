import { Home, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/Button';
import { Seo } from '@/components/common/Seo';
import { cn } from '@/lib/utils';

export default function ForbiddenPage() {
  return (
    <>
      <Seo title="Access denied" noIndex />

      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <span className="grid size-20 place-items-center rounded-3xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
          <ShieldAlert className="size-10" aria-hidden />
        </span>

        <p className="font-display mt-6 text-6xl font-bold text-amber-600 dark:text-amber-400">403</p>
        <h1 className="mt-2 text-2xl">You don't have access to this area</h1>
        <p className="text-muted mt-2.5 text-sm">
          This section is restricted to GoTour administrators. If you believe this is a mistake,
          contact your account owner.
        </p>

        <Link to="/" className={cn(buttonVariants(), 'mt-7')}>
          <Home className="size-4" aria-hidden />
          Back to home
        </Link>
      </div>
    </>
  );
}
