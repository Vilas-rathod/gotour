import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { SmartImage } from '@/components/common/SmartImage';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { HotelSummary } from '@/types/api';
import { WishlistHeart } from './WishlistHeart';

export interface HotelCardProps {
  item: HotelSummary;
  priority?: boolean;
  className?: string;
  layout?: 'vertical' | 'horizontal';
}

function StarRow({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${count} star hotel`}>
      {Array.from({ length: count }, (_, index) => (
        <Star key={index} className="star-fill size-3" aria-hidden />
      ))}
    </span>
  );
}

export function HotelCard({ item, priority = false, className, layout = 'vertical' }: HotelCardProps) {
  const wishlistItem = {
    itemType: 'HOTEL' as const,
    itemSlug: item.slug,
    title: item.name,
    subtitle: `${item.city}, ${item.country}`,
    imageUrl: item.heroImageUrl,
    price: item.pricePerNight,
    currency: item.currency,
  };

  if (layout === 'horizontal') {
    return (
      <Link
        to={`/hotels/${item.slug}`}
        className={cn(
          'surface-card-interactive group grid overflow-hidden rounded-3xl sm:grid-cols-[268px_1fr]',
          className,
        )}
      >
        <div className="relative">
          <SmartImage
            src={item.heroImageUrl}
            alt={item.name}
            wrapperClassName="aspect-[4/3] sm:h-full sm:aspect-auto"
            className="transition-transform duration-700 group-hover:scale-105"
            priority={priority}
          />
          <WishlistHeart item={wishlistItem} className="absolute top-2.5 right-2.5" />
        </div>

        <div className="flex flex-col p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <StarRow count={item.starRating} />
            {item.featured && <Badge variant="accent" size="sm">Featured</Badge>}
          </div>

          <h3 className="mt-1.5 font-display text-lg font-semibold transition-colors group-hover:text-brand-ink">
            {item.name}
          </h3>

          <p className="text-muted mt-1 flex items-center gap-1.5 text-xs font-medium">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              {item.city}, {item.country}
            </span>
          </p>

          <p className="text-muted mt-2 line-clamp-2-safe text-sm">{item.shortDescription}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.amenities.slice(0, 4).map((amenity) => (
              <Badge key={amenity} variant="neutral" size="sm">
                {amenity}
              </Badge>
            ))}
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <Rating value={item.rating} reviewCount={item.reviewCount} size="sm" />
            <div className="text-right">
              <span className="font-display nums-tabular text-xl font-bold text-brand-ink">
                {formatCurrency(item.pricePerNight, item.currency)}
              </span>
              <span className="text-faint block text-[11px]">per night</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/hotels/${item.slug}`}
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
        <StarRow count={item.starRating} />

        <h3 className="mt-1.5 line-clamp-2-safe font-display text-base leading-snug font-semibold transition-colors group-hover:text-brand-ink">
          {item.name}
        </h3>

        <p className="text-muted mt-1 flex items-center gap-1.5 text-xs font-medium">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {item.city}, {item.country}
          </span>
        </p>

        <div className="mt-2.5">
          <Rating value={item.rating} reviewCount={item.reviewCount} size="sm" />
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <span className="font-display nums-tabular text-lg font-bold text-brand-ink">
              {formatCurrency(item.pricePerNight, item.currency)}
            </span>
            <span className="text-faint block text-[11px]">per night</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
