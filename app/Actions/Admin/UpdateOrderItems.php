<?php

namespace App\Actions\Admin;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateOrderItems
{
    /**
     * Replace an order's line items with the given set, restocking the previous
     * variants and re-validating/decrementing stock for the new selection.
     *
     * @param  array<int, array{product_variant_id: int, quantity: int}>  $items
     */
    public function handle(Order $order, array $items): Order
    {
        if (! in_array($order->status, [OrderStatus::Pending, OrderStatus::Processing], true)) {
            throw ValidationException::withMessages([
                'items' => 'This order can no longer be edited — its contents are locked once shipped.',
            ]);
        }

        return DB::transaction(function () use ($order, $items) {
            $order->load('items');
            $previousItems = $order->items->map(fn (OrderItem $item) => [
                'product_name' => $item->product_name,
                'size' => $item->size,
                'quantity' => $item->quantity,
            ]);

            $variantIds = collect($items)->pluck('product_variant_id')
                ->merge($order->items->pluck('product_variant_id'))
                ->unique()
                ->values();

            $variants = ProductVariant::query()
                ->with('product')
                ->whereIn('id', $variantIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($order->items as $item) {
                $variants->get($item->product_variant_id)?->increment('stock_quantity', $item->quantity);
            }

            $order->items()->delete();

            $subtotal = 0;
            $lineItems = [];

            foreach ($items as $item) {
                /** @var ProductVariant|null $variant */
                $variant = $variants->get($item['product_variant_id']);

                if (! $variant) {
                    throw ValidationException::withMessages(['items' => 'One of the selected sizes is no longer available.']);
                }

                if ($variant->stock_quantity < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => "{$variant->product->name} (EU {$variant->size}) only has {$variant->stock_quantity} pair(s) left.",
                    ]);
                }

                $unitPrice = $variant->product->currentPrice();
                $subtotal += $unitPrice * $item['quantity'];

                $lineItems[] = [
                    'variant' => $variant,
                    'unit_price' => $unitPrice,
                    'quantity' => $item['quantity'],
                ];
            }

            foreach ($lineItems as $lineItem) {
                $order->items()->create([
                    'product_variant_id' => $lineItem['variant']->id,
                    'product_name' => $lineItem['variant']->product->name,
                    'size' => $lineItem['variant']->size,
                    'unit_price' => $lineItem['unit_price'],
                    'quantity' => $lineItem['quantity'],
                ]);

                $lineItem['variant']->decrement('stock_quantity', $lineItem['quantity']);
            }

            $order->update([
                'subtotal' => $subtotal,
                'total_amount' => $subtotal + $order->delivery_fee,
            ]);

            $newItems = collect($lineItems)->map(fn (array $lineItem) => [
                'product_name' => $lineItem['variant']->product->name,
                'size' => $lineItem['variant']->size,
                'quantity' => $lineItem['quantity'],
            ]);

            $order->notes()->create([
                'user_id' => auth()->id(),
                'note' => $this->describeChange($previousItems, $newItems),
            ]);

            return $order->fresh('items');
        });
    }

    /**
     * Describe an item-set change in human-readable form for the order's audit trail.
     * Uses the exact "Size updated from X to Y" phrasing for a clean 1-for-1 size swap
     * on the same product; otherwise a generic summary of the new item list.
     *
     * @param  Collection<int, array{product_name: string, size: string, quantity: int}>  $previousItems
     * @param  Collection<int, array{product_name: string, size: string, quantity: int}>  $newItems
     */
    private function describeChange(Collection $previousItems, Collection $newItems): string
    {
        if (
            $previousItems->count() === 1
            && $newItems->count() === 1
            && $previousItems->first()['product_name'] === $newItems->first()['product_name']
            && $previousItems->first()['quantity'] === $newItems->first()['quantity']
            && $previousItems->first()['size'] !== $newItems->first()['size']
        ) {
            return sprintf(
                'Size updated from %s to %s for %s.',
                $previousItems->first()['size'],
                $newItems->first()['size'],
                $newItems->first()['product_name'],
            );
        }

        $summary = $newItems
            ->map(fn (array $item) => "{$item['quantity']}x {$item['product_name']} (EU {$item['size']})")
            ->implode(', ');

        return "Order items updated. Now: {$summary}.";
    }
}
