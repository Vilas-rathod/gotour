import { ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { SmartImage } from '@/components/common/SmartImage';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { DestinationSummary } from '@/types/api';
import { WishlistHeart } from './WishlistHeart';

export interface DestinationCardProps {
  item: DestinationSummary;
  priority?: boolean;
  className?: string;
  /** `tall` is the immersive full-bleed treatment used on the home page. */
  variant?: 'standard' | 'tall';
}

export function DestinationCard({
  item,
  priority = false,
  className,
  variant = 'standard',
}: DestinationCardProps) {
  const wishlistItem = {
    itemType: 'DESTINATION' as const,
    itemSlug: item.slug,
    title: item.name,
    subtitle: item.country,
    imageUrl: item.heroImageUrl,
    price: item.averageBudget,
    currency: item.currency,
  };

  if (variant === 'tall') {
    return (
      <Link
        to={`/destinations/${item.slug}`}
        className={cn(
          'group relative block overflow-hidden rounded-3xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-lift',
          className,
        )}
      >
        <SmartImage
          src={item.heroImageUrl}
          alt={item.name}
          wrapperClassName="aspect-[3/4]"
          className="transition-transform duration-700 group-hover:scale-105"
          priority={priority}
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
        />
        <div className="card-scrim absolute inset-0" />

        <WishlistHeart item={wishlistItem} className="absolute top-3 right-3" />

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="flex items-center gap-1.5 text-xs font-medium text-white/80">
            <MapPin className="size-3.5" aria-hidden />
            {item.country}
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold">{item.name}</h3>

          <div className="mt-2.5 flex items-center justify-between gap-3">
            <Rating value={item.rating} reviewCount={item.reviewCount} size="sm" className="text-white" />
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all group-hover:bg-white group-hover:text-brand-800">
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/destinations/${item.slug}`}
      className={cn(
        'surface-card-interactive group flex flex-col overflow-hidden rounded-3xl',
        className,
      )}
    >
      <div className="relative">
        <SmartImage
          src={item.heroImageUrl}
          alt={item.name}
          wrapperClassName="aspect-[4/3]"
          className="transition-transform duration-700 group-hover:scale-105"
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {item.featured && (
          <Badge variant="accent" size="sm" className="absolute top-3 left-3">
            Featured
          </Badge>
        )}
        <WishlistHeart item={wishlistItem} className="absolute top-2.5 right-2.5" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-muted flex items-center gap-1.5 text-xs font-medium">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {item.city ? `${item.city}, ` : ''}
            {item.country}
          </span>
        </p>

        <h3 className="mt-1.5 font-display text-base font-semibold transition-colors group-hover:text-brand-ink">
          {item.name}
        </h3>
        <p className="text-muted mt-1.5 line-clamp-2-safe text-sm">{item.shortDescription}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="neutral" size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <Rating value={item.rating} reviewCount={item.reviewCount} size="sm" />
          {item.averageBudget !== null && (
            <div className="text-right">
              <span className="text-faint block text-[11px]">from</span>
              <span className="nums-tabular text-sm font-bold text-brand-ink">
                {formatCurrency(item.averageBudget, item.currency)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
