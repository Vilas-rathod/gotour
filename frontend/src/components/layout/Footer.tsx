import { Mail, MapPin, Phone } from 'lucide-react';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
} from '@/components/common/SocialIcons';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { Logo } from './Logo';

const FOOTER_COLUMNS = [
  {
    heading: 'Discover',
    links: [
      { label: 'Destinations', to: '/destinations' },
      { label: 'Tour packages', to: '/packages' },
      { label: 'Hotels', to: '/hotels' },
      { label: 'Travel stories', to: '/stories' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About GoTour', to: '/about' },
      { label: 'How it works', to: '/how-it-works' },
      { label: 'Contact us', to: '/contact' },
      { label: 'Careers', to: '/careers' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help centre', to: '/help' },
      { label: 'Booking policy', to: '/policies/booking' },
      { label: 'Cancellation & refunds', to: '/policies/refunds' },
      { label: 'Privacy policy', to: '/policies/privacy' },
    ],
  },
];

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com', icon: InstagramIcon },
  { label: 'Twitter', href: 'https://twitter.com', icon: TwitterIcon },
  { label: 'Facebook', href: 'https://facebook.com', icon: FacebookIcon },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: LinkedinIcon },
];

export function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    // Newsletter delivery is a marketing-platform concern, not a booking API.
    toast.success('You are on the list', 'Look out for our next travel edit.');
    setEmail('');
  };

  return (
    <footer className="mt-24 border-t border-[var(--border-subtle)] bg-[var(--surface-sunken)]">
      <div className="shell section-tight">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="text-muted mt-4 text-sm leading-relaxed">
              GoTour curates extraordinary journeys — from island escapes to high-altitude treks —
              with transparent pricing, verified stays and support at every step.
            </p>

            <ul className="text-muted mt-5 space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-brand-ink-soft" aria-hidden />
                Pune, Maharashtra, India
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-brand-ink-soft" aria-hidden />
                <a href="tel:+912041234567" className="hover:underline">
                  +91 20 4123 4567
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-brand-ink-soft" aria-hidden />
                <a href="mailto:hello@gotour.example.com" className="hover:underline">
                  hello@gotour.example.com
                </a>
              </li>
            </ul>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h3 className="font-sans text-[11px] font-bold tracking-[0.18em] text-brand-ink uppercase">
                {column.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-muted inline-block text-sm transition-all duration-200 hover:translate-x-0.5 hover:text-brand-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* ------------------------------------------------ newsletter */}
        <div className="relative mt-14 grid gap-6 overflow-hidden rounded-4xl bg-linear-to-br from-brand-700 via-brand-800 to-brand-950 p-7 shadow-lift sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div
            className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-gold-500/15 blur-3xl"
            aria-hidden
          />
          <div className="relative max-w-lg text-white">
            <h3 className="font-display text-2xl font-semibold sm:text-3xl">
              Travel inspiration, once a month
            </h3>
            <p className="mt-1.5 text-sm text-white/80">
              New destinations, seasonal deals and itinerary ideas. No spam, unsubscribe anytime.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="relative flex w-full gap-2.5 lg:w-96">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              aria-label="Email address for newsletter"
              className="border-white/25 bg-white/15 text-white placeholder:text-white/60"
            />
            <Button type="submit" variant="accent" className="shrink-0">
              Subscribe
            </Button>
          </form>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-5 border-t pt-7 sm:flex-row">
          <p className="text-muted text-xs">
            © {new Date().getFullYear()} GoTour Travel Technologies. All rights reserved.
          </p>

          <ul className="flex items-center gap-1.5">
            {SOCIALS.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={social.label}
                  className="text-muted grid size-9 place-items-center rounded-full border border-transparent transition-all hover:border-[var(--border-subtle)] hover:bg-[var(--surface-raised)] hover:text-brand-ink"
                >
                  <social.icon className="size-4" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
