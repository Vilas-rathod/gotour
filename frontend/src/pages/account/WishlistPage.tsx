import { Heart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useRemoveWishlistItemMutation,
  useWishlistQuery,
} from '@/features/wishlist/wishlistApi';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Seo } from '@/components/common/Seo';
import { SmartImage } from '@/components/common/SmartImage';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatRelative, humanizeEnum } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { WishlistItemType } from '@/types/api';

const TABS: { value: WishlistItemType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All saved' },
  { value: 'DESTINATION', label: 'Destinations' },
  { value: 'PACKAGE', label: 'Packages' },
  { value: 'HOTEL', label: 'Hotels' },
];

const LINK_PREFIX: Record<WishlistItemType, string> = {
  DESTINATION: '/destinations',
  PACKAGE: '/packages',
  HOTEL: '/hotels',
};

export default function WishlistPage() {
  const toast = useToast();
  const [tab, setTab] = useState<WishlistItemType | 'ALL'>('ALL');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useWishlistQuery({
    type: tab === 'ALL' ? undefined : tab,
    page,
    size: 12,
  });
  const [removeItem] = useRemoveWishlistItemMutation();

  const handleRemove = async (id: number, title: string) => {
    try {
      await removeItem(id).unwrap();
      toast.success('Removed from wishlist', title);
    } catch (error) {
      toast.apiError(error, 'Could not remove that item');
    }
  };

  return (
    <>
      <Seo title="My wishlist" noIndex />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">Saved for later</h2>
        {data && <span className="text-muted text-sm">{data.totalElements} saved</span>}
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => {
              setTab(item.value);
              setPage(0);
            }}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
              tab === item.value
                ? 'bg-linear-to-b from-brand-600 to-brand-800 text-white shadow-[0_1px_0_0_oklch(1_0_0/0.2)_inset,0_8px_18px_-8px_oklch(0.352_0.062_197/0.7)] dark:from-brand-300 dark:to-brand-500 dark:text-brand-950'
                : 'surface-card hover:bg-[var(--surface-muted)]',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Tap the heart on any destination, package or hotel to keep it here for later."
          action={
            <Link to="/destinations" className={cn(buttonVariants())}>
              Start exploring
            </Link>
          }
        />
      ) : (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {data.content.map((item) => (
              <li key={item.id}>
                <Card className="group h-full overflow-hidden">
                  <Link to={`${LINK_PREFIX[item.itemType]}/${item.itemSlug}`} className="block">
                    <div className="relative">
                      <SmartImage
                        src={item.imageUrl}
                        alt={item.title}
                        wrapperClassName="aspect-[16/10]"
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                      <Badge variant="brand" size="sm" className="absolute top-3 left-3">
                        {humanizeEnum(item.itemType)}
                      </Badge>
                    </div>
                  </Link>

                  <CardBody className="flex flex-col">
                    <Link
                      to={`${LINK_PREFIX[item.itemType]}/${item.itemSlug}`}
                      className="line-clamp-2-safe font-display font-semibold hover:text-brand-ink"
                    >
                      {item.title}
                    </Link>
                    {item.subtitle && (
                      <p className="text-muted mt-1 truncate text-xs">{item.subtitle}</p>
                    )}

                    <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                      <div>
                        {item.price !== null && (
                          <span className="font-display text-lg font-bold text-brand-ink">
                            {formatCurrency(item.price, item.currency ?? 'INR')}
                          </span>
                        )}
                        <span className="text-muted block text-[11px]">
                          Saved {formatRelative(item.savedAt)}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${item.title} from wishlist`}
                        className="text-muted hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        onClick={() => handleRemove(item.id, item.title)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
            className="mt-8"
          />
        </>
      )}
    </>
  );
}
