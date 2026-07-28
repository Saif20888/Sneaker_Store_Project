import { Link } from '@inertiajs/react';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { formatBdt } from '@/lib/currency';
import { DELIVERY_ZONES, feeForZone } from '@/lib/delivery';
import { index as checkoutIndex } from '@/routes/checkout';
import { show as showProduct } from '@/routes/products';

export default function CartDrawer() {
    const {
        items,
        isOpen,
        closeCart,
        removeItem,
        updateQuantity,
        subtotal,
        zone,
        setZone,
    } = useCart();

    const deliveryFee = items.length > 0 ? feeForZone(zone) : 0;
    const total = subtotal + deliveryFee;

    return (
        <Sheet
            open={isOpen}
            onOpenChange={(open) => (open ? undefined : closeCart())}
        >
            <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                <SheetHeader className="border-b border-store-gray">
                    <SheetTitle className="flex items-center gap-2 text-base font-bold tracking-wide uppercase">
                        <ShoppingBag className="size-4" />
                        Your Bag ({items.length})
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
                        <ShoppingBag className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Your bag is empty. Time to cop something.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-2 rounded-sm"
                            onClick={closeCart}
                        >
                            Continue Shopping
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto px-4 py-2">
                            <ul className="divide-y divide-store-gray">
                                {items.map((item) => (
                                    <li
                                        key={item.variant_id}
                                        className="flex gap-3 py-4"
                                    >
                                        <Link
                                            href={showProduct(
                                                item.product_slug,
                                            )}
                                            onClick={closeCart}
                                            className="flex size-16 shrink-0 items-center justify-center bg-store-gray/60 text-[10px] font-medium text-muted-foreground"
                                        >
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.product_name}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                item.brand
                                            )}
                                        </Link>
                                        <div className="flex flex-1 flex-col gap-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm leading-tight font-medium">
                                                    {item.product_name}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeItem(
                                                            item.variant_id,
                                                        )
                                                    }
                                                    className="text-muted-foreground hover:text-store-alert"
                                                    aria-label={`Remove ${item.product_name}`}
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                EU {item.size}
                                            </p>
                                            <div className="mt-1 flex items-center justify-between">
                                                <div className="flex items-center border border-store-gray">
                                                    <button
                                                        type="button"
                                                        className="flex size-7 items-center justify-center disabled:opacity-30"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.variant_id,
                                                                item.quantity -
                                                                    1,
                                                            )
                                                        }
                                                        disabled={
                                                            item.quantity <= 1
                                                        }
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="size-3" />
                                                    </button>
                                                    <span className="w-6 text-center text-xs font-medium">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="flex size-7 items-center justify-center disabled:opacity-30"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.variant_id,
                                                                item.quantity +
                                                                    1,
                                                            )
                                                        }
                                                        disabled={
                                                            item.quantity >=
                                                                item.stock_quantity ||
                                                            item.quantity >= 5
                                                        }
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="size-3" />
                                                    </button>
                                                </div>
                                                <p className="text-sm font-semibold">
                                                    {formatBdt(item.line_total)}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <SheetFooter className="gap-3 border-t border-store-gray bg-store-bone/60 p-4 text-store-ink">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium tracking-wide text-store-ink/60 uppercase">
                                    Delivery Zone
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    {DELIVERY_ZONES.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() =>
                                                setZone(option.value)
                                            }
                                            className={`rounded-sm border px-2 py-1.5 text-xs font-medium transition-colors ${
                                                zone === option.value
                                                    ? 'border-store-ink bg-store-ink text-store-bone'
                                                    : 'border-store-gray bg-white hover:border-store-ink'
                                            }`}
                                        >
                                            {option.label} ·{' '}
                                            {formatBdt(option.fee)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 text-sm">
                                <div className="flex justify-between text-store-ink/60">
                                    <span>Subtotal</span>
                                    <span>{formatBdt(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-store-ink/60">
                                    <span>Delivery</span>
                                    <span>{formatBdt(deliveryFee)}</span>
                                </div>
                                <div className="flex justify-between border-t border-store-gray pt-1 text-base font-bold">
                                    <span>Total</span>
                                    <span>{formatBdt(total)}</span>
                                </div>
                            </div>

                            <Button
                                asChild
                                size="lg"
                                className="rounded-sm bg-store-ink text-store-bone hover:bg-store-ink/90"
                                onClick={closeCart}
                            >
                                <Link href={checkoutIndex()}>Checkout</Link>
                            </Button>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
