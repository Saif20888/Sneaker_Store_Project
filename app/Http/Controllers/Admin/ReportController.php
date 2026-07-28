<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display the business report: revenue trend, status breakdown, and top sellers.
     */
    public function index(): Response
    {
        $rangeStart = Carbon::today()->subDays(29);

        $dailyRows = Order::query()
            ->where('status', '!=', OrderStatus::Cancelled)
            ->where('created_at', '>=', $rangeStart)
            ->selectRaw('DATE(created_at) as date, count(*) as orders, sum(total_amount) as revenue')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $trend = collect(range(0, 29))->map(function (int $offset) use ($rangeStart, $dailyRows) {
            $date = $rangeStart->copy()->addDays($offset)->toDateString();
            $row = $dailyRows->get($date);

            return [
                'date' => $date,
                'orders' => (int) ($row->orders ?? 0),
                'revenue' => (int) ($row->revenue ?? 0),
            ];
        });

        $statusBreakdown = collect(OrderStatus::cases())->map(fn (OrderStatus $case) => [
            'status' => $case->value,
            'label' => $case->label(),
            'count' => Order::query()->where('status', $case)->count(),
        ]);

        $topProducts = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', OrderStatus::Cancelled->value)
            ->selectRaw('order_items.product_name, sum(order_items.quantity) as units_sold, sum(order_items.unit_price * order_items.quantity) as revenue')
            ->groupBy('order_items.product_name')
            ->orderByDesc('units_sold')
            ->limit(5)
            ->get();

        $topBrands = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('product_variants', 'product_variants.id', '=', 'order_items.product_variant_id')
            ->join('products', 'products.id', '=', 'product_variants.product_id')
            ->join('brands', 'brands.id', '=', 'products.brand_id')
            ->where('orders.status', '!=', OrderStatus::Cancelled->value)
            ->selectRaw('brands.name as brand, sum(order_items.unit_price * order_items.quantity) as revenue')
            ->groupBy('brands.name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        $totalOrders = Order::query()->count();
        $cancelledOrders = Order::query()->where('status', OrderStatus::Cancelled)->count();
        $totalRevenue = (int) Order::query()->where('status', '!=', OrderStatus::Cancelled)->sum('total_amount');
        // "Non-cancelled" rather than strictly "completed" (delivered) — matches how
        // $totalRevenue itself is computed, so the average stays internally consistent.
        $nonCancelledOrders = max(1, $totalOrders - $cancelledOrders);

        return Inertia::render('admin/reports/index', [
            'kpis' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'average_order_value' => (int) round($totalRevenue / $nonCancelledOrders),
                'cancellation_rate' => $totalOrders > 0 ? round(($cancelledOrders / $totalOrders) * 100, 1) : 0,
            ],
            'trend' => $trend,
            'statusBreakdown' => $statusBreakdown,
            'topProducts' => $topProducts,
            'topBrands' => $topBrands,
        ]);
    }
}
