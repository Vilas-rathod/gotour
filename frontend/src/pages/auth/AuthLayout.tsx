import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { SmartImage } from '@/components/common/SmartImage';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export interface AuthLayoutProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/** Split-screen shell: form on the left, brand imagery on the right (desktop). */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10"
        >
          <h1 className="text-display-sm">{title}</h1>
          <p className="text-muted mt-2.5 text-sm leading-relaxed">{subtitle}</p>
          <hr className="rule-gold mt-7" />

          <div className="mt-7">{children}</div>

          {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
        </motion.div>

        <p className="text-muted text-center text-xs">
          By continuing you agree to our{' '}
          <Link to="/policies/terms" className="underline underline-offset-2 hover:text-brand-ink">
            terms
          </Link>{' '}
          and{' '}
          <Link to="/policies/privacy" className="underline underline-offset-2 hover:text-brand-ink">
            privacy policy
          </Link>
          .
        </p>
      </div>

      <aside className="relative hidden lg:block">
        <SmartImage
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=75"
          alt=""
          wrapperClassName="absolute inset-0"
          priority
        />
        <div className="hero-scrim absolute inset-0" />

        <figure className="absolute inset-x-0 bottom-0 p-14 text-white">
          <Quote className="size-8 text-gold-300" aria-hidden />
          <blockquote className="mt-4 max-w-md font-display text-2xl leading-snug font-medium">
            “We booked a nine-day trip in under twenty minutes and never once had to chase anyone
            for a confirmation.”
          </blockquote>
          <figcaption className="mt-4 text-sm text-white/75">
            Ananya D. — Bali honeymoon, 2026
          </figcaption>
        </figure>
      </aside>
    </div>
  );
}
