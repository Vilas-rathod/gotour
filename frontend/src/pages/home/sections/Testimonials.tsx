import { Quote } from 'lucide-react';
import { Carousel } from '@/components/common/Carousel';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Reveal } from '@/components/common/Reveal';
import { Rating } from '@/components/ui/Rating';
import { initialsOf } from '@/lib/format';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Ananya Deshpande',
    trip: 'Bali Honeymoon · 7 nights',
    rating: 5,
    quote:
      'Every transfer, every check-in was already arranged. We genuinely did not have to think about logistics once in nine days.',
  },
  {
    id: 2,
    name: 'Rahul Mehta',
    trip: 'Ladakh Ride · 9 nights',
    rating: 5,
    quote:
      'The itinerary had realistic riding days, not the punishing schedule other operators sell. Acclimatisation was built in properly.',
  },
  {
    id: 3,
    name: 'Sarah Whitfield',
    trip: 'Kenya Safari · 6 nights',
    rating: 4.5,
    quote:
      'Our guide knew the reserve intimately. We saw a leopard on day two because he knew exactly which riverbed to sit at.',
  },
  {
    id: 4,
    name: 'Vikram Nair',
    trip: 'Kerala Backwaters · 4 nights',
    rating: 5,
    quote:
      'Booked on a Tuesday, travelling by Friday. Support answered on the second ring when our flight moved.',
  },
  {
    id: 5,
    name: 'Meera Krishnan',
    trip: 'Swiss Alps · 8 nights',
    rating: 5,
    quote:
      'The price on the listing was the price I paid. After years of booking travel, that alone made me come back.',
  },
];

export function Testimonials() {
  return (
    <section className="relative bg-[var(--surface-sunken)] section">
      <div className="shell">
        <Reveal>
          <SectionHeading
            eyebrow="Traveller stories"
            title="12,000+ trips, and counting"
            description="Reviews collected from travellers who completed a GoTour booking."
            align="center"
          />
        </Reveal>

        <Carousel
          ariaLabel="Traveller testimonials"
          items={TESTIMONIALS}
          getKey={(item) => item.id}
          perView={{ base: 1.08, sm: 2, md: 2, lg: 3 }}
          autoplay
          loop
          renderItem={(item) => (
            <figure className="surface-card relative flex h-full flex-col overflow-hidden rounded-3xl p-7">
              {/* Oversized, cropped and set low in the stack: reads as a
                  watermark rather than an icon competing with the quote. */}
              <Quote
                className="pointer-events-none absolute -top-3 -right-3 size-24 text-gold-500/12 dark:text-gold-400/12"
                aria-hidden
              />
              <blockquote className="relative flex-1 font-display text-[0.975rem] leading-relaxed text-pretty">
                “{item.quote}”
              </blockquote>

              <figcaption className="relative mt-6 flex items-center gap-3 border-t pt-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-500 to-brand-700 text-sm font-bold text-white ring-1 ring-white/20">
                  {initialsOf(item.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{item.name}</span>
                  <span className="text-muted block truncate text-xs">{item.trip}</span>
                </span>
                <Rating value={item.rating} size="sm" showValue={false} />
              </figcaption>
            </figure>
          )}
        />
      </div>
    </section>
  );
}
