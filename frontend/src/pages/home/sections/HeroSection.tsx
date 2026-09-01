import { motion, useReducedMotion } from 'framer-motion';
import { Award, ShieldCheck, Sparkles } from 'lucide-react';
import { HeroSearchBar } from '@/components/search/HeroSearchBar';
import { SmartImage } from '@/components/common/SmartImage';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2000&q=75';

const TRUST_SIGNALS = [
  { icon: ShieldCheck, label: 'Secure payments', detail: 'PCI-compliant checkout' },
  { icon: Award, label: '4.8 average rating', detail: 'From 12,000+ travellers' },
  { icon: Sparkles, label: 'Handpicked stays', detail: 'Verified by our team' },
];

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  // The negative margin cancels the top padding `main` applies for ordinary
  // pages, so the image runs full-bleed beneath the fixed navbar.
  return (
    <section className="relative isolate -mt-16 min-h-[94svh] overflow-hidden lg:-mt-18 lg:min-h-[92svh]">
      {/* A very slow push-in. At 8s over 6% it is below the threshold of
          conscious motion but stops the frame reading as a flat backdrop. */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={reduceMotion ? false : { scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: 'easeOut' }}
      >
        <SmartImage
          src={HERO_IMAGE}
          alt="Traveller looking out over a mountain lake at sunrise"
          wrapperClassName="absolute inset-0"
          priority
        />
      </motion.div>
      <div className="hero-scrim absolute inset-0 -z-10" />

      {/* Hands the hero off to the page below instead of ending on a hard
          horizon line. */}
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-linear-to-t from-[var(--surface)] to-transparent"
        aria-hidden
      />

      <div className="shell flex min-h-[94svh] flex-col justify-end pt-28 pb-20 lg:min-h-[92svh] lg:justify-center lg:pt-32 lg:pb-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <span className="glass-on-media inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-white">
            <Sparkles className="size-3.5 text-gold-300" aria-hidden />
            Over 240 destinations across 6 continents
          </span>

          <h1 className="text-display-xl mt-6 font-semibold text-white [text-shadow:0_2px_28px_oklch(0_0_0/0.35)]">
            Extraordinary journeys,
            <span className="text-gradient-gold block">effortlessly booked.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Curated tour packages, verified luxury stays and itineraries built by people who have
            actually been there. Plan in minutes, travel for years of memories.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 lg:mt-11"
        >
          <HeroSearchBar />
        </motion.div>

        <motion.ul
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-10 hidden gap-10 sm:flex"
        >
          {TRUST_SIGNALS.map((signal) => (
            <li key={signal.label} className="flex items-center gap-3 text-white">
              <span className="glass-on-media grid size-11 place-items-center rounded-full text-gold-300">
                <signal.icon className="size-4.5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold">{signal.label}</span>
                <span className="block text-xs text-white/70">{signal.detail}</span>
              </span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
