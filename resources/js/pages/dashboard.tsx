import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Boxes,
    Clock,
    PackageSearch,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import OrderStatusBadge from '@/components/admin/order-status-badge';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBdt } from '@/lib/currency';
import { formatOrderCustomerId } from '@/lib/customer-id';
import { dashboard } from '@/routes';
import { show as showOrder } from '@/routes/admin/orders';
import type { DashboardInvitation } from '@/types';

type Stats = {
    pending_orders: number;
    processing_orders: number;
    orders_today: number;
    revenue_30d: number;
    total_products: number;
    low_stock_count: number;
};

type RecentOrder = {
    order_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    status_label: string;
    created_at: string;
    user_id: number | null;
    guest_id: string | null;
};

type LowStockVariant = {
    product_name: string;
    size: string;
    stock_quantity: number;
};

type Props = {
    pendingInvitations?: DashboardInvitation[];
    stats: Stats;
    recentOrders: RecentOrder[];
    lowStockVariants: LowStockVariant[];
};

export default function Dashboard({
    pendingInvitations = [],
    stats,
    recentOrders,
    lowStockVariants,
}: Props) {
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );

    const statCards = [
        {
            label: 'Orders Received',
            value: stats.pending_orders,
            icon: PackageSearch,
            hint: 'Awaiting processing',
        },
        {
            label: 'Processing',
            value: stats.processing_orders,
            icon: Clock,
            hint: 'Being packed',
        },
        {
            label: 'Revenue (30d)',
            value: formatBdt(stats.revenue_30d),
            icon: Wallet,
            hint: `${stats.orders_today} order(s) today`,
        },
        {
            label: 'Low Stock',
            value: stats.low_stock_count,
            icon: AlertTriangle,
            hint: `${stats.total_products} products total`,
        },
    ];

    return (
        <>
            <Head title="Home" />
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map(({ label, value, icon: Icon, hint }) => (
                        <Card key={label}>
                            <CardContent className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase">
                                        {label}
                                    </p>
                                    <p className="mt-1 text-2xl font-bold">
                                        {value}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {hint}
                                    </p>
                                </div>
                                <Icon className="size-5 text-muted-foreground" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentOrders.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No orders yet.
                                </p>
                            ) : (
                                <div className="flex flex-col divide-y">
                                    {recentOrders.map((order) => (
                                        <Link
                                            key={order.order_number}
                                            href={
                                                showOrder(order.order_number)
                                                    .url
                                            }
                                            className="flex items-center justify-between gap-3 py-2.5 text-sm hover:bg-muted/40"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {order.order_number}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.customer_name} ·{' '}
                                                    {formatOrderCustomerId(
                                                        order.user_id,
                                                        order.guest_id,
                                                    )}{' '}
                                                    · {order.created_at}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium">
                                                    {formatBdt(
                                                        order.total_amount,
                                                    )}
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
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Boxes className="size-4" />
                                Low Stock Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lowStockVariants.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Stock levels look healthy.
                                </p>
                            ) : (
                                <div className="flex flex-col divide-y">
                                    {lowStockVariants.map((variant, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between py-2.5 text-sm"
                                        >
                                            <span>
                                                {variant.product_name}{' '}
                                                <span className="text-muted-foreground">
                                                    (EU {variant.size})
                                                </span>
                                            </span>
                                            <span className="font-semibold text-store-alert">
                                                {variant.stock_quantity} left
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Home',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});
