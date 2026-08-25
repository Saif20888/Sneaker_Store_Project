<?php

namespace App\Actions\Admin;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateOrderStatus
{
    /**
     * Update an order's status, restocking or re-reserving variant stock when the
     * status transitions into or out of a stock-restocking status (Cancelled, Returned).
     */
    public function handle(Order $order, OrderStatus $status): Order
    {
        return DB::transaction(function () use ($order, $status) {
            $order = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($status === $order->status) {
                return $order;
            }

            $order->load('items');

            $variants = ProductVariant::query()
                ->with('product')
                ->whereIn('id', $order->items->pluck('product_variant_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            if ($status->restocksInventory() && ! $order->status->restocksInventory()) {
                foreach ($order->items as $item) {
                    $variants->get($item->product_variant_id)?->increment('stock_quantity', $item->quantity);
                }
            } elseif (! $status->restocksInventory() && $order->status->restocksInventory()) {
                foreach ($order->items as $item) {
                    $variant = $variants->get($item->product_variant_id);

                    if (! $variant || $variant->stock_quantity < $item->quantity) {
                        $name = $variant?->product->name ?? $item->product_name;

                        throw ValidationException::withMessages([
                            'status' => "Can't reopen this order — {$name} (EU {$item->size}) no longer has enough stock.",
                        ]);
                    }
                }

                foreach ($order->items as $item) {
                    $variants->get($item->product_variant_id)?->decrement('stock_quantity', $item->quantity);
                }
            }

            $order->update(['status' => $status]);

            return $order;
        });
    }
}
