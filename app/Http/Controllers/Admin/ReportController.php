<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Carbon;
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
        $excludedStatuses = [OrderStatus::Cancelled->value, OrderStatus::Returned->value];

        $dailyRows = Order::query()
            ->whereNotIn('status', $excludedStatuses)
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
            ->whereNotIn('orders.status', $excludedStatuses)
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
            ->whereNotIn('orders.status', $excludedStatuses)
            ->selectRaw('brands.name as brand, sum(order_items.unit_price * order_items.quantity) as revenue')
            ->groupBy('brands.name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        $totalOrders = Order::query()->count();
        $cancelledOrders = Order::query()->whereIn('status', $excludedStatuses)->count();
        $totalRevenue = (int) Order::query()->whereNotIn('status', $excludedStatuses)->sum('total_amount');
        // "Non-cancelled/returned" rather than strictly "completed" (delivered) — matches how
        // $totalRevenue itself is computed, so the average stays internally consistent.
        $nonCancelledOrders = max(1, $totalOrders - $cancelledOrders);

        // Profit = what the customer paid minus what the goods cost us minus the actual
        // courier cost, summed per order. Only counts orders with a recorded courier cost
        // where every line item's product also has a purchase price recorded — a partially
        // known order is simply left out of the total rather than guessed at.
        $totalProfit = Order::query()
            ->whereNotIn('status', $excludedStatuses)
            ->whereNotNull('actual_delivery_cost')
            ->with('items.variant.product')
            ->get()
            ->reduce(function (int $profit, Order $order) {
                $purchasePrices = $order->items->map(fn (OrderItem $item) => $item->variant?->product?->purchase_price);

                if ($purchasePrices->contains(null)) {
                    return $profit;
                }

                $itemsMargin = $order->items->sum(fn (OrderItem $item) => ($item->unit_price - $item->variant->product->purchase_price) * $item->quantity);

                return $profit + $itemsMargin - $order->actual_delivery_cost;
            }, 0);

        return Inertia::render('admin/reports/index', [
            'kpis' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'average_order_value' => (int) round($totalRevenue / $nonCancelledOrders),
                'cancellation_rate' => $totalOrders > 0 ? round(($cancelledOrders / $totalOrders) * 100, 1) : 0,
                'total_profit' => (int) $totalProfit,
            ],
            'trend' => $trend,
            'statusBreakdown' => $statusBreakdown,
            'topProducts' => $topProducts,
            'topBrands' => $topBrands,
        ]);
    }
}
