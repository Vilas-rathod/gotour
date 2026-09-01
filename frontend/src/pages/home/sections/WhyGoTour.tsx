import { motion } from 'framer-motion';
import { BadgeCheck, HeadphonesIcon, ShieldCheck, Wallet } from 'lucide-react';
import { Reveal, RevealGroup, revealItem } from '@/components/common/Reveal';
import { SectionHeading } from '@/components/common/SectionHeading';

const PILLARS = [
  {
    icon: BadgeCheck,
    title: 'Verified by humans',
    description:
      'Every hotel and tour operator is inspected and re-rated each season. If it is on GoTour, we have been there.',
  },
  {
    icon: Wallet,
    title: 'Honest pricing',
    description:
      'The price you see includes taxes and fees. No surprise service charges at the payment step, ever.',
  },
  {
    icon: ShieldCheck,
    title: 'Protected payments',
    description:
      'Checkout runs through a PCI-compliant gateway with signature verification on every transaction.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Support that answers',
    description:
      'Real travel specialists on chat and phone, from the moment you book until you are home again.',
  },
];

export function WhyGoTour() {
  return (
    <section className="shell section">
      <Reveal>
        <SectionHeading
          eyebrow="Why GoTour"
          title="Booking a trip should feel as good as taking one"
          description="We built GoTour around the things travellers told us matter most."
          align="center"
        />
      </Reveal>

      <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((pillar) => (
          <motion.article
            key={pillar.title}
            variants={revealItem}
            className="surface-card-interactive group relative overflow-hidden rounded-3xl p-7"
          >
            {/* A gold hairline that draws across the top edge on hover — the
                cheapest possible way to make a static card feel responsive. */}
            <span
              className="absolute inset-x-0 top-0 h-px scale-x-0 bg-linear-to-r from-transparent via-gold-500 to-transparent transition-transform duration-500 group-hover:scale-x-100"
              aria-hidden
            />
            <span className="grid size-13 place-items-center rounded-2xl bg-linear-to-br from-brand-50 to-brand-100 text-brand-700 ring-1 ring-brand-600/10 dark:from-brand-950 dark:to-brand-900 dark:text-brand-300 dark:ring-brand-400/15">
              <pillar.icon className="size-6" aria-hidden />
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold">{pillar.title}</h3>
            <p className="text-muted mt-2 text-sm leading-relaxed">{pillar.description}</p>
          </motion.article>
        ))}
      </RevealGroup>
    </section>
  );
}
