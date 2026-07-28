<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\TeamInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $email = strtolower($request->user()->email);

        $pendingInvitations = TeamInvitation::query()
            ->with(['inviter', 'team'])
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNull('accepted_at')
            ->where(fn ($query) => $query
                ->whereNull('expires_at')
                ->orWhere('expires_at', '>=', now()))
            ->latest()
            ->get()
            ->map(fn (TeamInvitation $invitation) => [
                'code' => $invitation->code,
                'inviterName' => $invitation->inviter->name,
                'team' => [
                    'name' => $invitation->team->name,
                    'slug' => $invitation->team->slug,
                ],
            ]);

        return Inertia::render('dashboard', [
            'pendingInvitations' => $pendingInvitations,
            'stats' => [
                'pending_orders' => Order::query()->where('status', OrderStatus::Pending)->count(),
                'processing_orders' => Order::query()->where('status', OrderStatus::Processing)->count(),
                'orders_today' => Order::query()->whereDate('created_at', Carbon::today())->count(),
                'revenue_30d' => (int) Order::query()
                    ->where('status', '!=', OrderStatus::Cancelled)
                    ->where('created_at', '>=', Carbon::now()->subDays(30))
                    ->sum('total_amount'),
                'total_products' => Product::query()->count(),
                'low_stock_count' => ProductVariant::query()->where('stock_quantity', '>', 0)->where('stock_quantity', '<=', 3)->count(),
            ],
            'recentOrders' => Order::query()
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn (Order $order) => [
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'total_amount' => $order->total_amount,
                    'status' => $order->status->value,
                    'status_label' => $order->status->label(),
                    'created_at' => $order->created_at->diffForHumans(),
                    'user_id' => $order->user_id,
                    'guest_id' => $order->guest_id,
                ]),
            'lowStockVariants' => ProductVariant::query()
                ->with('product')
                ->where('stock_quantity', '>', 0)
                ->where('stock_quantity', '<=', 3)
                ->orderBy('stock_quantity')
                ->limit(8)
                ->get()
                ->map(fn (ProductVariant $variant) => [
                    'product_name' => $variant->product->name,
                    'size' => $variant->size,
                    'stock_quantity' => $variant->stock_quantity,
                ]),
        ]);
    }
}
