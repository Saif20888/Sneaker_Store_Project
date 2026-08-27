<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display the business report: revenue trend, status breakdown, and top sellers,
     * scoped to a chosen date range (week, month, year, or a custom start/end).
     */
    public function index(Request $request): Response
    {
        [$range, $start, $end] = $this->resolveRange($request);
        $excludedStatuses = [OrderStatus::Cancelled->value, OrderStatus::Returned->value];

        $ordersInRange = Order::query()
            ->whereBetween('created_at', [$start, $end]);

        $dailyRows = (clone $ordersInRange)
            ->whereNotIn('status', $excludedStatuses)
            ->selectRaw('DATE(created_at) as date, count(*) as orders, sum(total_amount) as revenue')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $dayCount = (int) $start->diffInDays($end) + 1;
        $trend = collect(range(0, $dayCount - 1))->map(function (int $offset) use ($start, $dailyRows) {
            $date = $start->copy()->addDays($offset)->toDateString();
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
            'count' => (clone $ordersInRange)->where('status', $case)->count(),
        ]);

        $topProducts = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereNotIn('orders.status', $excludedStatuses)
            ->whereBetween('orders.created_at', [$start, $end])
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
            ->whereBetween('orders.created_at', [$start, $end])
            ->selectRaw('brands.name as brand, sum(order_items.unit_price * order_items.quantity) as revenue')
            ->groupBy('brands.name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        $totalOrders = (clone $ordersInRange)->count();
        $cancelledOrders = (clone $ordersInRange)->whereIn('status', $excludedStatuses)->count();
        $totalRevenue = (int) (clone $ordersInRange)->whereNotIn('status', $excludedStatuses)->sum('total_amount');
        // "Non-cancelled/returned" rather than strictly "completed" (delivered) — matches how
        // $totalRevenue itself is computed, so the average stays internally consistent.
        $nonCancelledOrders = max(1, $totalOrders - $cancelledOrders);

        // Profit = what the customer paid minus what the goods cost us minus the actual
        // courier cost, summed per order. Only counts orders with a recorded courier cost
        // where every line item's product also has a purchase price recorded — a partially
        // known order is simply left out of the total rather than guessed at.
        $totalProfit = (clone $ordersInRange)
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
            'range' => [
                'value' => $range,
                'from' => $start->toDateString(),
                'to' => $end->toDateString(),
            ],
        ]);
    }

    /**
     * Resolve the requested date range into a [range, start, end] tuple. Falls back to
     * "month" for an unrecognized or missing range, and to the month range for a custom
     * range with a missing or invalid from/to.
     *
     * @return array{0: string, 1: Carbon, 2: Carbon}
     */
    private function resolveRange(Request $request): array
    {
        $range = $request->string('range')->value();

        if ($range === 'custom') {
            $from = $request->date('from');
            $to = $request->date('to');

            if ($from && $to && $from->lte($to)) {
                return ['custom', $from->copy()->startOfDay(), $to->copy()->endOfDay()];
            }
        }

        $today = Carbon::today();

        return match ($range) {
            'week' => ['week', $today->copy()->subDays(6), $today->copy()->endOfDay()],
            'year' => ['year', $today->copy()->subDays(364), $today->copy()->endOfDay()],
            default => ['month', $today->copy()->subDays(29), $today->copy()->endOfDay()],
        };
    }
}
