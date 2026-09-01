import { ArrowRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/common/Reveal';
import { SmartImage } from '@/components/common/SmartImage';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function CallToAction() {
  return (
    <section className="shell section">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-5xl ring-1 ring-black/5 dark:ring-white/10">
          <SmartImage
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1800&q=70"
            alt=""
            wrapperClassName="absolute inset-0 -z-10"
          />
          <div className="hero-scrim absolute inset-0 -z-10" />

          <div className="flex flex-col items-start gap-8 px-7 py-16 sm:px-14 lg:flex-row lg:items-center lg:justify-between lg:py-24">
            <div className="max-w-xl text-white">
              <span className="glass-on-media inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold">
                <Compass className="size-3.5" aria-hidden />
                Your next trip starts here
              </span>
              <h2 className="text-display-lg mt-5 text-white">Ready when you are</h2>
              <p className="mt-4 text-base leading-relaxed text-white/85">
                Create a free account to save destinations, track bookings and get early access to
                seasonal fares.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                to="/register"
                className={cn(buttonVariants({ variant: 'accent', size: 'lg' }), 'w-full sm:w-auto')}
              >
                Create free account
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                to="/packages"
                className={cn(buttonVariants({ variant: 'glass', size: 'lg' }), 'w-full sm:w-auto')}
              >
                Browse packages
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
