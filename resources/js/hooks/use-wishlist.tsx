import { router, usePage } from '@inertiajs/react';
import { toggle as toggleWishlist } from '@/routes/wishlist';
import type { WishlistShare } from '@/types/store';

/**
 * Wishlist state lives in the session on the server and arrives as a shared Inertia prop on
 * every response, mirroring the cart pattern — toggling just dispatches a request and lets
 * the next page's shared `wishlist` prop reflect the new state.
 */
export function useWishlist() {
    const { wishlist } = usePage<{ wishlist: WishlistShare }>().props;

    const ids = wishlist?.ids ?? [];
    const count = wishlist?.count ?? 0;

    const isWishlisted = (productId: number) => ids.includes(productId);

    const toggle = (productId: number) => {
        router.post(
            toggleWishlist().url,
            { product_id: productId },
            { preserveScroll: true, preserveState: true },
        );
    };

    return { ids, count, isWishlisted, toggle };
}
