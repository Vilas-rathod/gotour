import { ArrowUpRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SmartImage } from '@/components/common/SmartImage';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Reveal, RevealGroup, revealItem } from '@/components/common/Reveal';
import { Badge } from '@/components/ui/Badge';

/**
 * Editorial content is authored in the CMS, not the booking APIs — these
 * entries are static until a content service is introduced.
 */
const STORIES = [
  {
    slug: 'first-time-in-kyoto',
    category: 'City guide',
    title: 'First time in Kyoto: a 5-day walking route',
    excerpt:
      'Temples before breakfast, tea houses at dusk, and the one district most visitors miss entirely.',
    readMinutes: 7,
    image:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=70',
  },
  {
    slug: 'monsoon-in-the-western-ghats',
    category: 'Seasonal',
    title: 'Why the monsoon is the best time for the Western Ghats',
    excerpt:
      'Waterfalls at full force, half the crowds and rates that drop by a third. Here is how to plan it.',
    readMinutes: 5,
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=70',
  },
  {
    slug: 'packing-for-a-safari',
    category: 'Practical',
    title: 'Packing for a safari without overpacking',
    excerpt:
      'What actually earns its place in a 15 kg bush-flight allowance, from someone who got it wrong twice.',
    readMinutes: 6,
    image:
      'https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=900&q=70',
  },
];

export function TravelStories() {
  return (
    <section className="shell section">
      <Reveal>
        <SectionHeading
          eyebrow="From the journal"
          title="Travel stories & guides"
          description="Practical, opinionated writing from the people who plan our trips."
          href="/stories"
          linkLabel="Read the journal"
        />
      </Reveal>

      <RevealGroup className="grid gap-6 md:grid-cols-3">
        {STORIES.map((story) => (
          <motion.article key={story.slug} variants={revealItem}>
            <Link
              to={`/stories/${story.slug}`}
              className="surface-card-interactive group flex h-full flex-col overflow-hidden rounded-3xl"
            >
              <div className="relative">
                <SmartImage
                  src={story.image}
                  alt={story.title}
                  wrapperClassName="aspect-[16/10]"
                  className="transition-transform duration-700 group-hover:scale-105"
                />
                <Badge variant="brand" size="sm" className="absolute top-3 left-3">
                  {story.category}
                </Badge>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-lg leading-snug font-semibold transition-colors group-hover:text-brand-ink">
                  {story.title}
                </h3>
                <p className="text-muted mt-2 line-clamp-2-safe text-sm">{story.excerpt}</p>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="text-muted inline-flex items-center gap-1.5 text-xs">
                    <Clock className="size-3.5" aria-hidden />
                    {story.readMinutes} min read
                  </span>
                  <ArrowUpRight
                    className="size-4 text-brand-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-brand-400"
                    aria-hidden
                  />
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </RevealGroup>
    </section>
  );
}
