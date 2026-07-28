import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import OrderStatusBadge from '@/components/admin/order-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatBdt } from '@/lib/currency';
import { formatOrderCustomerId } from '@/lib/customer-id';
import { create, index, show } from '@/routes/admin/orders';

type AdminOrderRow = {
    order_number: string;
    source: string;
    customer_name: string;
    phone_number: string;
    city: string;
    total_amount: number;
    status: string;
    created_at: string;
    user_id: number | null;
    guest_id: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Tab = { value: string; label: string; count: number };

type OrdersProps = {
    orders: {
        data: AdminOrderRow[];
        links: PaginationLink[];
        total: number;
    };
    statusFilter: string;
    search: string;
    tabs: Tab[];
};

export default function AdminOrdersIndex({
    orders,
    statusFilter,
    search,
    tabs,
}: OrdersProps) {
    const [query, setQuery] = useState(search);

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            index().url,
            { status: statusFilter, q: query },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Orders" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Orders</h1>
                        <p className="text-sm text-muted-foreground">
                            {orders.total} order{orders.total === 1 ? '' : 's'}{' '}
                            total
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add Manual Order
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-b pb-3">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.value}
                            href={
                                index({
                                    query: { status: tab.value, q: search },
                                }).url
                            }
                            preserveState
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                statusFilter === tab.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            {tab.label} ({tab.count})
                        </Link>
                    ))}
                </div>

                <form
                    onSubmit={submitSearch}
                    className="flex max-w-sm items-center gap-2"
                >
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search order #, name, or phone"
                    />
                    <Button type="submit" size="icon" variant="outline">
                        <Search className="size-4" />
                    </Button>
                </form>

                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left text-xs font-semibold uppercase">
                            <tr>
                                <th className="p-3">Order ID</th>
                                <th className="p-3">Source</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Customer ID</th>
                                <th className="p-3">City</th>
                                <th className="p-3">Total</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Placed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.data.map((order) => (
                                <tr
                                    key={order.order_number}
                                    className="cursor-pointer hover:bg-muted/40"
                                    onClick={() =>
                                        router.visit(
                                            show(order.order_number).url,
                                        )
                                    }
                                >
                                    <td className="p-3 font-medium">
                                        {order.order_number}
                                    </td>
                                    <td className="p-3">
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                                            {order.source}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {order.customer_name}
                                        <div className="text-xs text-muted-foreground">
                                            {order.phone_number}
                                        </div>
                                    </td>
                                    <td className="p-3 text-muted-foreground">
                                        {formatOrderCustomerId(
                                            order.user_id,
                                            order.guest_id,
                                        )}
                                    </td>
                                    <td className="p-3">{order.city}</td>
                                    <td className="p-3">
                                        {formatBdt(order.total_amount)}
                                    </td>
                                    <td className="p-3">
                                        <OrderStatusBadge
                                            status={order.status}
                                            label={
                                                tabs.find(
                                                    (tab) =>
                                                        tab.value ===
                                                        order.status,
                                                )?.label ?? order.status
                                            }
                                        />
                                    </td>
                                    <td className="p-3 text-muted-foreground">
                                        {order.created_at}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {orders.data.length === 0 && (
                    <p className="py-10 text-center text-sm text-muted-foreground">
                        No orders in this view yet.
                    </p>
                )}

                {orders.links.length > 3 && (
                    <nav className="flex flex-wrap gap-1">
                        {orders.links.map((link) => (
                            <Link
                                key={link.label}
                                href={link.url ?? '#'}
                                preserveState
                                className={`rounded-md px-3 py-1.5 text-sm ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted'
                                } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </nav>
                )}
            </div>
        </>
    );
}
