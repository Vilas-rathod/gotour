import { Reveal } from '@/components/common/Reveal';

/** Wordmarks kept as text so the section stays crisp at any DPI and theme. */
const PARTNERS = [
  'Skyline Air',
  'Meridian Hotels',
  'Trailhead Outfitters',
  'Coastline Cruises',
  'Summit Rail',
  'Azure Resorts',
];

export function PartnerBrands() {
  return (
    <section className="border-y border-[var(--border-subtle)] bg-[var(--surface-sunken)] section-tight">
      <div className="shell">
        <Reveal>
          <p className="text-faint text-center text-[11px] font-bold tracking-[0.24em] uppercase">
            Trusted by leading travel partners
          </p>

          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:gap-x-14">
            {PARTNERS.map((partner) => (
              <li
                key={partner}
                className="font-display text-lg font-semibold text-[var(--text-muted)] opacity-55 transition-all duration-300 hover:text-brand-ink hover:opacity-100 sm:text-xl"
              >
                {partner}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
