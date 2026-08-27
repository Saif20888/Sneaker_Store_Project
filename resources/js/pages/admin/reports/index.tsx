import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatBdt } from '@/lib/currency';
import { index as reportsIndex } from '@/routes/admin/reports';

type Kpis = {
    total_revenue: number;
    total_orders: number;
    average_order_value: number;
    cancellation_rate: number;
    total_profit: number;
};

type TrendPoint = { date: string; orders: number; revenue: number };
type StatusRow = { status: string; label: string; count: number };
type TopProduct = { product_name: string; units_sold: number; revenue: number };
type TopBrand = { brand: string; revenue: number };
type RangeInfo = { value: string; from: string; to: string };

type ReportsProps = {
    kpis: Kpis;
    trend: TrendPoint[];
    statusBreakdown: StatusRow[];
    topProducts: TopProduct[];
    topBrands: TopBrand[];
    range: RangeInfo;
};

const RANGE_OPTIONS: { value: string; label: string }[] = [
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Yearly' },
    { value: 'custom', label: 'Custom' },
];

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-500',
    processing: 'bg-blue-500',
    shipped: 'bg-indigo-500',
    delivered: 'bg-emerald-500',
    cancelled: 'bg-red-500',
    returned: 'bg-orange-500',
};

export default function AdminReportsIndex({
    kpis,
    trend,
    statusBreakdown,
    topProducts,
    topBrands,
    range,
}: ReportsProps) {
    const maxRevenue = Math.max(1, ...trend.map((point) => point.revenue));
    const maxStatusCount = Math.max(
        1,
        ...statusBreakdown.map((row) => row.count),
    );

    const [customFrom, setCustomFrom] = useState(range.from);
    const [customTo, setCustomTo] = useState(range.to);

    const applyRange = (value: string) => {
        if (value === 'custom') {
            router.get(
                reportsIndex().url,
                { range: 'custom', from: customFrom, to: customTo },
                { preserveState: true, preserveScroll: true },
            );

            return;
        }

        router.get(
            reportsIndex().url,
            { range: value },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Business Report" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold">Business Report</h1>
                        <p className="text-sm text-muted-foreground">
                            {range.from} to {range.to}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {RANGE_OPTIONS.map((option) => (
                            <Button
                                key={option.value}
                                type="button"
                                size="sm"
                                variant={
                                    range.value === option.value
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() => applyRange(option.value)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {range.value === 'custom' && (
                    <div className="flex flex-wrap items-end gap-2 rounded-md border p-3">
                        <div className="grid gap-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                                From
                            </label>
                            <Input
                                type="date"
                                value={customFrom}
                                onChange={(e) =>
                                    setCustomFrom(e.target.value)
                                }
                                className="w-40"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                                To
                            </label>
                            <Input
                                type="date"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                className="w-40"
                            />
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => applyRange('custom')}
                        >
                            Apply
                        </Button>
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent>
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                                Total Revenue
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {formatBdt(kpis.total_revenue)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                                Total Orders
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {kpis.total_orders}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                                Avg Order Value
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {formatBdt(kpis.average_order_value)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                                Cancellation Rate
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {kpis.cancellation_rate}%
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                                Profit
                            </p>
                            <p
                                className={`mt-1 text-2xl font-bold ${kpis.total_profit < 0 ? 'text-destructive' : ''}`}
                            >
                                {formatBdt(kpis.total_profit)}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                Purchase price minus selling price and courier
                                cost, orders with recorded costs only
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daily Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-40 items-end gap-1">
                            {trend.map((point) => (
                                <div
                                    key={point.date}
                                    className="group relative flex-1"
                                >
                                    <div
                                        className="w-full rounded-t-sm bg-store-ink/80 transition-colors group-hover:bg-store-alert"
                                        style={{
                                            height: `${Math.max(2, (point.revenue / maxRevenue) * 100)}%`,
                                        }}
                                    />
                                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 w-max -translate-x-1/2 rounded-sm bg-store-ink px-2 py-1 text-[10px] text-store-bone opacity-0 transition-opacity group-hover:opacity-100">
                                        {point.date}: {formatBdt(point.revenue)}{' '}
                                        ({point.orders} orders)
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Orders by Status</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {statusBreakdown.map((row) => (
                                <div
                                    key={row.status}
                                    className="flex flex-col gap-1"
                                >
                                    <div className="flex justify-between text-xs">
                                        <span>{row.label}</span>
                                        <span className="text-muted-foreground">
                                            {row.count}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={`h-full rounded-full ${STATUS_COLORS[row.status] ?? 'bg-primary'}`}
                                            style={{
                                                width: `${(row.count / maxStatusCount) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Brands by Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {topBrands.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No sales yet.
                                </p>
                            ) : (
                                <div className="flex flex-col divide-y">
                                    {topBrands.map((brand) => (
                                        <div
                                            key={brand.brand}
                                            className="flex items-center justify-between py-2 text-sm"
                                        >
                                            <span>{brand.brand}</span>
                                            <span className="font-medium">
                                                {formatBdt(brand.revenue)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Products</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        {topProducts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No sales yet.
                            </p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="text-left text-xs font-semibold text-muted-foreground uppercase">
                                    <tr>
                                        <th className="py-2">Product</th>
                                        <th className="py-2">Units Sold</th>
                                        <th className="py-2">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {topProducts.map((product) => (
                                        <tr key={product.product_name}>
                                            <td className="py-2 font-medium">
                                                {product.product_name}
                                            </td>
                                            <td className="py-2">
                                                {product.units_sold}
                                            </td>
                                            <td className="py-2">
                                                {formatBdt(product.revenue)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
