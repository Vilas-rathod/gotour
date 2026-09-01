import { Compass, Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/Button';
import { Seo } from '@/components/common/Seo';
import { cn } from '@/lib/utils';

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" noIndex />

      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <span className="grid size-20 place-items-center rounded-3xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
          <Compass className="size-10" aria-hidden />
        </span>

        <p className="font-display mt-6 text-6xl font-bold text-brand-ink">404</p>
        <h1 className="mt-2 text-2xl">This route isn't on our map</h1>
        <p className="text-muted mt-2.5 text-sm">
          The page you're looking for has moved or never existed. Let's get you back on track.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link to="/" className={cn(buttonVariants())}>
            <Home className="size-4" aria-hidden />
            Back to home
          </Link>
          <Link to="/search" className={cn(buttonVariants({ variant: 'secondary' }))}>
            <Search className="size-4" aria-hidden />
            Search GoTour
          </Link>
        </div>
      </div>
    </>
  );
}
