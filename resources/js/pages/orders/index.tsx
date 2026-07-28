import { Head, Link, usePage } from '@inertiajs/react';
import { PackageSearch } from 'lucide-react';
import OrderStatusBadge from '@/components/admin/order-status-badge';
import { Button } from '@/components/ui/button';
import { formatBdt } from '@/lib/currency';
import { formatCustomerId } from '@/lib/customer-id';
import { success as showOrder } from '@/routes/orders';
import { index as shopIndex } from '@/routes/products';
import type { Auth } from '@/types';

type OrderRow = {
    order_number: string;
    status: string;
    status_label: string;
    total_amount: number;
    items_count: number;
    created_at: string;
};

type OrderHistoryProps = {
    orders: OrderRow[];
    guestId: string | null;
};

export default function OrderHistoryIndex({
    orders,
    guestId,
}: OrderHistoryProps) {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title="Order History" />

            <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-extrabold tracking-tight uppercase">
                    Order History
                </h1>
                {auth.user ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                        Every order you&apos;ve placed while signed in, past and
                        present. Customer ID:{' '}
                        <span className="font-semibold text-store-ink">
                            {formatCustomerId(auth.user.id)}
                        </span>
                    </p>
                ) : guestId ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                        Orders placed as a guest on this browser. Guest ID:{' '}
                        <span className="font-semibold text-store-ink">
                            {guestId}
                        </span>
                    </p>
                ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                        Place an order or sign in to see your order history
                        here.
                    </p>
                )}

                {orders.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center gap-3 border border-dashed border-store-gray py-16 text-center">
                        <PackageSearch className="size-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            No orders placed while signed in yet.
                        </p>
                        <Button asChild className="mt-2 rounded-sm">
                            <Link href={shopIndex()}>Start Shopping</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="mt-8 flex flex-col divide-y divide-store-gray border-y border-store-gray">
                        {orders.map((order) => (
                            <Link
                                key={order.order_number}
                                href={showOrder(order.order_number).url}
                                className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-store-cream/30"
                            >
                                <div>
                                    <p className="text-sm font-semibold tracking-wide uppercase">
                                        {order.order_number}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {order.created_at} · {order.items_count}{' '}
                                        item{order.items_count === 1 ? '' : 's'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold">
                                        {formatBdt(order.total_amount)}
                                    </span>
                                    <OrderStatusBadge
                                        status={order.status}
                                        label={order.status_label}
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
