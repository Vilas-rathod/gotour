import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SmartImage } from '@/components/common/SmartImage';
import { Reveal } from '@/components/common/Reveal';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const COLLECTIONS = [
  {
    title: 'Overwater villas',
    caption: 'Maldives & Polynesia',
    to: '/packages?travelStyle=LUXURY',
    image:
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1000&q=70',
    span: 'sm:col-span-2 sm:row-span-2',
  },
  {
    title: 'Desert camps',
    caption: 'Rajasthan & Morocco',
    to: '/packages?travelStyle=CULTURAL',
    image:
      'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=70',
    span: '',
  },
  {
    title: 'Alpine lodges',
    caption: 'Switzerland & Japan',
    to: '/packages?travelStyle=MOUNTAIN',
    image:
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=70',
    span: '',
  },
  {
    title: 'Safari reserves',
    caption: 'Kenya & Botswana',
    to: '/packages?travelStyle=WILDLIFE',
    image:
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=70',
    span: 'sm:col-span-2',
  },
];

export function LuxuryCollection() {
  return (
    <section className="section relative overflow-hidden bg-brand-950 text-white">
      {/* Two offset pools of colour give the flat near-black panel a light
          source, so the photographs sit *in* it rather than on it. */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 size-[30rem] rounded-full bg-brand-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-48 -left-32 size-[26rem] rounded-full bg-gold-600/12 blur-3xl"
        aria-hidden
      />

      <div className="relative shell">
        <Reveal>
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-white/8 px-4 py-2 text-xs font-semibold tracking-wide text-gold-200">
                <Sparkles className="size-3.5" aria-hidden />
                The Luxe Collection
              </span>
              <h2 className="text-display-md mt-5 text-white">
                Stays that are the reason you travel
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/70">
                Private guides, sunrise breakfasts and rooms with a view worth the flight. Our most
                requested collection, curated for slow, unhurried travel.
              </p>
            </div>

            <Link
              to="/packages?travelStyle=LUXURY"
              className={cn(buttonVariants({ variant: 'glass', size: 'lg' }), 'shrink-0')}
            >
              Explore the collection
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Reveal>

        <div className="grid auto-rows-[168px] grid-cols-2 gap-4 sm:auto-rows-[212px] sm:grid-cols-4">
          {COLLECTIONS.map((collection, index) => (
            <motion.div
              key={collection.title}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={collection.span}
            >
              <Link
                to={collection.to}
                className="group relative block size-full overflow-hidden rounded-3xl ring-1 ring-white/10 transition-all duration-300 hover:ring-gold-400/45"
              >
                <SmartImage
                  src={collection.image}
                  alt={collection.title}
                  wrapperClassName="absolute inset-0"
                  className="transition-transform duration-700 group-hover:scale-105"
                />
                <div className="card-scrim absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-gold-200 uppercase">
                    {collection.caption}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-white">
                    {collection.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
