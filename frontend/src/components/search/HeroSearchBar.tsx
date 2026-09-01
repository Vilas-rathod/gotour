import { CalendarDays, MapPin, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { toIsoDate } from '@/lib/format';

type SearchTab = 'packages' | 'hotels' | 'destinations';

const TABS: { id: SearchTab; label: string }[] = [
  { id: 'packages', label: 'Tour packages' },
  { id: 'hotels', label: 'Hotels' },
  { id: 'destinations', label: 'Destinations' },
];

/**
 * The primary conversion surface. Collapses to a stacked card on mobile and
 * expands into a single glass bar on desktop.
 */
export function HeroSearchBar({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<SearchTab>('packages');
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [travellers, setTravellers] = useState(2);

  const today = toIsoDate(new Date());

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (startDate) params.set('startDate', startDate);
    if (travellers > 0) params.set('travellers', String(travellers));

    navigate(`/${tab}?${params.toString()}`);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* ------------------------------------------------------- tabs */}
      <div className="mb-3.5 flex gap-1.5 overflow-x-auto no-scrollbar" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all',
              tab === item.id
                ? 'bg-[var(--surface-raised)] text-brand-ink elev-3'
                : 'glass-on-media text-white hover:bg-white/20',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-2 rounded-3xl border border-white/15 bg-[var(--surface-raised)] p-2.5 shadow-lift sm:rounded-full lg:grid-cols-[1.7fr_1fr_0.85fr_auto] lg:items-center"
      >
        <label className="flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-colors hover:bg-[var(--surface-muted)] sm:rounded-full">
          <MapPin className="size-5 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="text-faint block text-[10px] font-bold tracking-[0.14em] uppercase">
              Where to
            </span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search destination, package or hotel"
              aria-label="Search destination, package or hotel"
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-[var(--text-muted)]"
            />
          </span>
        </label>

        <label className="flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-colors hover:bg-[var(--surface-muted)] sm:rounded-full lg:border-l lg:border-[var(--border-subtle)]">
          <CalendarDays className="size-5 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="text-faint block text-[10px] font-bold tracking-[0.14em] uppercase">
              Departure
            </span>
            <input
              type="date"
              value={startDate}
              min={today}
              onChange={(event) => setStartDate(event.target.value)}
              aria-label="Departure date"
              className="w-full bg-transparent text-sm font-medium outline-none"
            />
          </span>
        </label>

        <label className="flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-colors hover:bg-[var(--surface-muted)] sm:rounded-full lg:border-l lg:border-[var(--border-subtle)]">
          <Users className="size-5 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="text-faint block text-[10px] font-bold tracking-[0.14em] uppercase">
              Travellers
            </span>
            <input
              type="number"
              min={1}
              max={20}
              value={travellers}
              onChange={(event) => setTravellers(Number(event.target.value))}
              aria-label="Number of travellers"
              className="w-full bg-transparent text-sm font-medium outline-none"
            />
          </span>
        </label>

        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="w-full lg:w-auto"
          leftIcon={<Search className="size-4" />}
        >
          Search
        </Button>
      </form>
    </div>
  );
}
