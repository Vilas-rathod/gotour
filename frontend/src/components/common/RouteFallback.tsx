import { Skeleton } from '@/components/ui/Skeleton';

/** Shown while a lazily-loaded route chunk is in flight. */
export function RouteFallback() {
  return (
    <div className="shell section-tight">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="surface-card overflow-hidden rounded-2xl">
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full-page spinner used before the persisted session has been read. */
export function AppBootFallback() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex flex-col items-center gap-4">
        <span className="grid size-14 animate-pulse place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700">
          <svg viewBox="0 0 64 64" className="size-7" aria-hidden>
            <path d="M44 20 L28 44 L24 33 L14 29 Z" fill="white" />
          </svg>
        </span>
        <p className="text-muted text-sm">Preparing your journey…</p>
      </div>
    </div>
  );
}
