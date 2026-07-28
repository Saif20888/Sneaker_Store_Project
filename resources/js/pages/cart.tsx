import { Head, Link } from '@inertiajs/react';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { formatBdt } from '@/lib/currency';
import { DELIVERY_ZONES, feeForZone } from '@/lib/delivery';
import { index as checkoutIndex } from '@/routes/checkout';
import { index as shopIndex } from '@/routes/products';

export default function Cart() {
    const { items, subtotal, zone, setZone, removeItem, updateQuantity } =
        useCart();

    const deliveryFee = items.length > 0 ? feeForZone(zone) : 0;
    const total = subtotal + deliveryFee;

    if (items.length === 0) {
        return (
            <>
                <Head title="Your Bag" />
                <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
                    <ShoppingBag className="size-10 text-muted-foreground" />
                    <h1 className="text-xl font-extrabold tracking-tight uppercase">
                        Your bag is empty
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Browse the catalog and add your next pair.
                    </p>
                    <Button
                        asChild
                        className="rounded-sm bg-store-ink text-store-bone hover:bg-store-ink/90"
                    >
                        <Link href={shopIndex()}>Shop All Sneakers</Link>
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Your Bag" />

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
                <h1 className="mb-8 text-2xl font-extrabold tracking-tight uppercase">
                    Your Bag
                </h1>

                <div className="grid gap-10 lg:grid-cols-5">
                    <ul className="flex flex-col divide-y divide-store-gray lg:col-span-3">
                        {items.map((item) => (
                            <li
                                key={item.variant_id}
                                className="flex gap-4 py-5"
                            >
                                <div className="flex size-24 shrink-0 items-center justify-center bg-store-gray/60 text-[10px] font-medium text-muted-foreground">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.product_name}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        item.brand
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col gap-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm leading-tight font-medium">
                                            {item.product_name}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeItem(item.variant_id)
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
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center border border-store-gray">
                                            <button
                                                type="button"
                                                className="flex size-8 items-center justify-center disabled:opacity-30"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.variant_id,
                                                        item.quantity - 1,
                                                    )
                                                }
                                                disabled={item.quantity <= 1}
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="size-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                className="flex size-8 items-center justify-center disabled:opacity-30"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.variant_id,
                                                        item.quantity + 1,
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

                    <div className="h-fit border border-store-gray bg-store-gray/20 p-5 lg:col-span-2">
                        <h2 className="text-xs font-semibold tracking-wide uppercase">
                            Delivery Zone
                        </h2>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {DELIVERY_ZONES.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setZone(option.value)}
                                    className={`rounded-sm border px-2 py-1.5 text-xs font-medium transition-colors ${
                                        zone === option.value
                                            ? 'border-store-ink bg-store-ink text-store-bone'
                                            : 'border-store-gray text-foreground hover:border-store-ink'
                                    }`}
                                >
                                    {option.label} · {formatBdt(option.fee)}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 flex flex-col gap-1 border-t border-store-gray pt-3 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{formatBdt(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
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
                            className="mt-4 w-full rounded-sm bg-store-ink text-store-bone hover:bg-store-ink/90"
                        >
                            <Link href={checkoutIndex()}>
                                Proceed to Checkout
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
