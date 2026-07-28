import { router, usePage } from '@inertiajs/react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { DeliveryZoneValue } from '@/lib/delivery';
import {
    destroy as removeFromCart,
    store as addToCart,
    update as updateCartItem,
} from '@/routes/cart';
import type { CartShare } from '@/types/store';

type CartUiContextValue = {
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    zone: DeliveryZoneValue;
    setZone: (zone: DeliveryZoneValue) => void;
};

const CartUiContext = createContext<CartUiContextValue | null>(null);

const ZONE_STORAGE_KEY = 'sole-craft-bd:zone';

function readStoredZone(): DeliveryZoneValue {
    if (typeof window === 'undefined') {
        return 'inside_dhaka';
    }

    return window.localStorage.getItem(ZONE_STORAGE_KEY) === 'outside_dhaka'
        ? 'outside_dhaka'
        : 'inside_dhaka';
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [zone, setZone] = useState<DeliveryZoneValue>(() => readStoredZone());

    useEffect(() => {
        window.localStorage.setItem(ZONE_STORAGE_KEY, zone);
    }, [zone]);

    return (
        <CartUiContext.Provider
            value={{
                isOpen,
                openCart: () => setIsOpen(true),
                closeCart: () => setIsOpen(false),
                zone,
                setZone,
            }}
        >
            {children}
        </CartUiContext.Provider>
    );
}

/**
 * Cart data lives in the session on the server and arrives as a shared Inertia prop on
 * every response, so add/update/remove just dispatch a request and let the next page's
 * shared `cart` prop reflect the new state — no client-side cache to keep in sync.
 */
export function useCart() {
    const ui = useContext(CartUiContext);

    if (!ui) {
        throw new Error('useCart must be used within a CartProvider');
    }

    const { cart } = usePage<{ cart: CartShare }>().props;

    const addItem = (variantId: number, quantity = 1) => {
        router.post(
            addToCart().url,
            { variant_id: variantId, quantity },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => ui.openCart(),
            },
        );
    };

    const updateQuantity = (variantId: number, quantity: number) => {
        router.patch(
            updateCartItem().url,
            { variant_id: variantId, quantity },
            { preserveScroll: true, preserveState: true },
        );
    };

    const removeItem = (variantId: number) => {
        router.delete(removeFromCart().url, {
            data: { variant_id: variantId },
            preserveScroll: true,
            preserveState: true,
        });
    };

    return {
        items: cart?.items ?? [],
        count: cart?.count ?? 0,
        subtotal: cart?.subtotal ?? 0,
        addItem,
        updateQuantity,
        removeItem,
        ...ui,
    };
}
