import { Clock, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { SmartImage } from '@/components/common/SmartImage';
import { formatCurrency, humanizeEnum } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PackageSummary } from '@/types/api';
import { WishlistHeart } from './WishlistHeart';

export interface PackageCardProps {
  item: PackageSummary;
  priority?: boolean;
  className?: string;
  /** Horizontal layout used inside search results on wide screens. */
  layout?: 'vertical' | 'horizontal';
}

export function PackageCard({
  item,
  priority = false,
  className,
  layout = 'vertical',
}: PackageCardProps) {
  const discounted = item.discountPrice !== null && item.discountPrice < item.price;

  const wishlistItem = {
    itemType: 'PACKAGE' as const,
    itemSlug: item.slug,
    title: item.title,
    subtitle: `${item.destinationName}, ${item.destinationCountry}`,
    imageUrl: item.heroImageUrl,
    price: item.effectivePrice,
    currency: item.currency,
  };

  if (layout === 'horizontal') {
    return (
      <Link
        to={`/packages/${item.slug}`}
        className={cn(
          'surface-card-interactive group grid overflow-hidden rounded-3xl sm:grid-cols-[268px_1fr]',
          className,
        )}
      >
        <div className="relative">
          <SmartImage
            src={item.heroImageUrl}
            alt={item.title}
            wrapperClassName="aspect-[4/3] sm:h-full sm:aspect-auto"
            className="transition-transform duration-700 group-hover:scale-105"
            priority={priority}
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {item.trending && <Badge variant="accent" size="sm">Trending</Badge>}
            {discounted && (
              <Badge variant="success" size="sm">
                {item.discountPercent}% off
              </Badge>
            )}
          </div>
          <WishlistHeart item={wishlistItem} className="absolute top-2.5 right-2.5" />
        </div>

        <div className="flex flex-col p-4 sm:p-5">
          <p className="text-muted flex items-center gap-1.5 text-xs font-medium">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              {item.destinationName}, {item.destinationCountry}
            </span>
          </p>

          <h3 className="mt-1.5 font-display text-lg leading-snug font-semibold transition-colors group-hover:text-brand-ink">
            {item.title}
          </h3>
          <p className="text-muted mt-1.5 line-clamp-2-safe text-sm">{item.summary}</p>

          <div className="text-muted mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              {item.durationDays}D / {item.durationNights}N
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden />
              {humanizeEnum(item.packageType)}
            </span>
            <Badge variant="brand" size="sm">
              {humanizeEnum(item.travelStyle)}
            </Badge>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <Rating value={item.rating} reviewCount={item.reviewCount} size="sm" />
            <div className="text-right">
              {discounted && (
                <span className="text-faint nums-tabular block text-xs line-through">
                  {formatCurrency(item.price, item.currency)}
                </span>
              )}
              <span className="font-display nums-tabular text-xl font-bold text-brand-ink">
                {formatCurrency(item.effectivePrice, item.currency)}
              </span>
              <span className="text-faint block text-[11px]">per person</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/packages/${item.slug}`}
      className={cn(
        'surface-card-interactive group flex flex-col overflow-hidden rounded-3xl',
        className,
      )}
    >
      <div className="relative">
        <SmartImage
          src={item.heroImageUrl}
          alt={item.title}
          wrapperClassName="aspect-[4/3]"
          className="transition-transform duration-700 group-hover:scale-105"
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {item.trending && <Badge variant="accent" size="sm">Trending</Badge>}
          {discounted && (
            <Badge variant="success" size="sm">
              {item.discountPercent}% off
            </Badge>
          )}
        </div>

        <WishlistHeart item={wishlistItem} className="absolute top-2.5 right-2.5" />

        <div className="absolute bottom-3 left-3">
          <span className="glass-on-media inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white">
            <Clock className="size-3" aria-hidden />
            {item.durationDays}D / {item.durationNights}N
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-muted flex items-center gap-1.5 text-xs font-medium">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {item.destinationName}, {item.destinationCountry}
          </span>
        </p>

        <h3 className="mt-1.5 line-clamp-2-safe font-display text-base leading-snug font-semibold transition-colors group-hover:text-brand-ink">
          {item.title}
        </h3>

        <div className="mt-2.5">
          <Rating value={item.rating} reviewCount={item.reviewCount} size="sm" />
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            {discounted && (
              <span className="text-faint nums-tabular block text-xs line-through">
                {formatCurrency(item.price, item.currency)}
              </span>
            )}
            <span className="font-display nums-tabular text-lg font-bold text-brand-ink">
              {formatCurrency(item.effectivePrice, item.currency)}
            </span>
            <span className="text-faint block text-[11px]">per person</span>
          </div>
          <Badge variant="brand" size="sm">
            {humanizeEnum(item.travelStyle)}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
