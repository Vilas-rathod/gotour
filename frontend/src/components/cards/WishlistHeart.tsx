import { Heart } from 'lucide-react';
import { useWishlistToggle } from '@/hooks/useWishlistToggle';
import { cn } from '@/lib/utils';
import type { SaveWishlistItemRequest } from '@/types/api';

export interface WishlistHeartProps {
  item: SaveWishlistItemRequest;
  className?: string;
  variant?: 'overlay' | 'plain';
}

/** Save/unsave control shared by every catalogue card and detail hero. */
export function WishlistHeart({ item, className, variant = 'overlay' }: WishlistHeartProps) {
  const { isSaved, toggleItem, isToggling } = useWishlistToggle();
  const saved = isSaved(item.itemType, item.itemSlug);

  return (
    <button
      type="button"
      disabled={isToggling}
      aria-label={saved ? `Remove ${item.title} from wishlist` : `Save ${item.title} to wishlist`}
      aria-pressed={saved}
      onClick={(event) => {
        // Cards are wrapped in a Link — don't navigate when saving.
        event.preventDefault();
        event.stopPropagation();
        void toggleItem(item);
      }}
      className={cn(
        'grid size-9 place-items-center rounded-full transition-all active:scale-90 disabled:opacity-60',
        variant === 'overlay'
          ? 'bg-black/35 text-white backdrop-blur-sm hover:bg-black/50'
          : 'surface-card hover:bg-[var(--surface-muted)]',
        className,
      )}
    >
      <Heart
        className={cn(
          'size-4.5 transition-all',
          saved ? 'scale-110 fill-rose-500 text-rose-500' : 'fill-transparent',
        )}
        aria-hidden
      />
    </button>
  );
}
