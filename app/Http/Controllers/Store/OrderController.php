<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display the customer's order history — by account if signed in, otherwise by
     * the guest id cookie stamped on their orders at checkout.
     */
    public function index(Request $request): Response
    {
        $guestId = $request->cookie('guest_id');

        $query = match (true) {
            (bool) $request->user() => $request->user()->orders(),
            (bool) $guestId => Order::query()->where('guest_id', $guestId),
            default => Order::query()->whereRaw('1 = 0'),
        };

        $orders = $query->latest()
            ->get()
            ->map(fn (Order $order) => [
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'total_amount' => $order->total_amount,
                'items_count' => $order->items()->count(),
                'created_at' => $order->created_at->toDayDateTimeString(),
            ]);

        return Inertia::render('orders/index', [
            'orders' => $orders,
            'guestId' => $request->user() ? null : $guestId,
        ]);
    }

    /**
     * Display the order confirmation page. Restricted to the order's owner (signed-in
     * account or matching guest_id cookie) so order numbers alone can't be used to view
     * someone else's name, phone number, and shipping address.
     */
    public function show(Request $request, Order $order): Response
    {
        $ownedByUser = $request->user() && $order->user_id === $request->user()->id;
        $ownedByGuestCookie = $order->guest_id && $order->guest_id === $request->cookie('guest_id');

        abort_unless($ownedByUser || $ownedByGuestCookie, 404);

        $order->load('items');

        return Inertia::render('orders/success', [
            'order' => [
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'phone_number' => $order->phone_number,
                'city' => $order->city,
                'shipping_address' => $order->shipping_address,
                'zone' => $order->zone->label(),
                'delivery_fee' => $order->delivery_fee,
                'estimated_delivery' => $order->zone->estimatedDelivery(),
                'subtotal' => $order->subtotal,
                'total_amount' => $order->total_amount,
                'payment_method' => $order->payment_method->label(),
                'payment_transaction_id' => $order->payment_transaction_id,
                'status' => $order->status->label(),
                'created_at' => $order->created_at->toDayDateTimeString(),
                'guest_id' => $order->guest_id,
                'items' => $order->items->map(fn ($item) => [
                    'product_name' => $item->product_name,
                    'size' => $item->size,
                    'unit_price' => $item->unit_price,
                    'quantity' => $item->quantity,
                ]),
            ],
        ]);
    }
}
