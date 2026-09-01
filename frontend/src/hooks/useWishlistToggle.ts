import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useToggleWishlistMutation,
  useWishlistSlugsQuery,
} from '@/features/wishlist/wishlistApi';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import type { SaveWishlistItemRequest, WishlistItemType } from '@/types/api';

/**
 * Shared "save to wishlist" behaviour for every card and detail page.
 * Anonymous users are routed to login with a return path instead of failing.
 */
export function useWishlistToggle() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: slugs } = useWishlistSlugsQuery(undefined, { skip: !isAuthenticated });
  const [toggle, { isLoading }] = useToggleWishlistMutation();

  const isSaved = useCallback(
    (type: WishlistItemType, slug: string): boolean => {
      if (!slugs) return false;
      const bucket =
        type === 'DESTINATION' ? slugs.destinations : type === 'PACKAGE' ? slugs.packages : slugs.hotels;
      return bucket.includes(slug);
    },
    [slugs],
  );

  const toggleItem = useCallback(
    async (item: SaveWishlistItemRequest) => {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: window.location.pathname } });
        return;
      }
      try {
        const result = await toggle(item).unwrap();
        toast.success(
          result.saved ? 'Saved to wishlist' : 'Removed from wishlist',
          result.saved ? item.title : undefined,
        );
      } catch (error) {
        toast.apiError(error, 'Could not update your wishlist');
      }
    },
    [isAuthenticated, navigate, toggle, toast],
  );

  return { isSaved, toggleItem, isToggling: isLoading };
}
