<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackOrderController extends Controller
{
    /**
     * Display the order tracking lookup form, and the result if a lookup was submitted.
     */
    public function index(Request $request): Response
    {
        $orderNumber = $request->string('order_number')->trim()->toString();
        $phoneNumber = $request->string('phone_number')->trim()->toString();

        if ($orderNumber === '' || $phoneNumber === '') {
            return Inertia::render('track-order', [
                'query' => ['order_number' => $orderNumber, 'phone_number' => $phoneNumber],
            ]);
        }

        $order = Order::query()
            ->with('items')
            ->where('order_number', $orderNumber)
            ->where('phone_number', $phoneNumber)
            ->first();

        return Inertia::render('track-order', [
            'query' => ['order_number' => $orderNumber, 'phone_number' => $phoneNumber],
            'order' => $order ? [
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'status_label' => $order->status->trackingLabel(),
                'tracking_step' => $order->status->trackingStep(),
                'zone' => $order->zone->label(),
                'estimated_delivery' => $order->zone->estimatedDelivery(),
                'total_amount' => $order->total_amount,
                'created_at' => $order->created_at->toDayDateTimeString(),
                'items' => $order->items->map(fn ($item) => [
                    'product_name' => $item->product_name,
                    'size' => $item->size,
                    'quantity' => $item->quantity,
                ]),
            ] : null,
            'notFound' => ! $order,
        ]);
    }
}
