<?php

namespace App\Actions\Admin;

use App\Enums\ExchangeCondition;
use App\Enums\OrderStatus;
use App\Models\ExchangeRecord;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProcessExchange
{
    /**
     * Swap a delivered order's line item for a different size: restock (or write off) the
     * returned variant, decrement the new one, update the order's item/totals, and log an
     * audit note — mirrors the locking/transaction style of UpdateOrderStatus/UpdateOrderItems.
     */
    public function handle(
        Order $order,
        OrderItem $item,
        int $newVariantId,
        ExchangeCondition $condition,
        int $shippingCharge = 0,
        ?string $notes = null,
    ): ExchangeRecord {
        if (! in_array($order->status, [OrderStatus::Shipped, OrderStatus::Delivered], true)) {
            throw ValidationException::withMessages([
                'order_item_id' => 'Only shipped or delivered orders can be exchanged — edit the order items instead.',
            ]);
        }

        if ($item->order_id !== $order->id) {
            throw ValidationException::withMessages([
                'order_item_id' => 'That item does not belong to this order.',
            ]);
        }

        return DB::transaction(function () use ($order, $item, $newVariantId, $condition, $shippingCharge, $notes) {
            $variants = ProductVariant::query()
                ->with('product')
                ->whereIn('id', [$item->product_variant_id, $newVariantId])
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $returnedVariant = $variants->get($item->product_variant_id);
            $newVariant = $variants->get($newVariantId);

            if (! $newVariant) {
                throw ValidationException::withMessages(['new_variant_id' => 'The selected replacement size is no longer available.']);
            }

            if ($condition === ExchangeCondition::Restocked) {
                $returnedVariant?->increment('stock_quantity', $item->quantity);
            }

            if ($newVariant->stock_quantity < $item->quantity) {
                throw ValidationException::withMessages([
                    'new_variant_id' => "{$newVariant->product->name} (EU {$newVariant->size}) only has {$newVariant->stock_quantity} pair(s) left.",
                ]);
            }

            $newVariant->decrement('stock_quantity', $item->quantity);

            $newUnitPrice = $newVariant->product->currentPrice();
            $priceDifference = ($newUnitPrice - $item->unit_price) * $item->quantity;
            $balanceAmount = $priceDifference + $shippingCharge;

            $oldProductName = $item->product_name;
            $oldSize = $item->size;
            $oldVariantId = $item->product_variant_id;

            $item->update([
                'product_variant_id' => $newVariant->id,
                'product_name' => $newVariant->product->name,
                'size' => $newVariant->size,
                'unit_price' => $newUnitPrice,
            ]);

            $order->update([
                'subtotal' => $order->subtotal + $priceDifference,
                'total_amount' => $order->total_amount + $priceDifference,
            ]);

            $exchange = $order->exchanges()->create([
                'order_item_id' => $item->id,
                'returned_variant_id' => $oldVariantId,
                'new_variant_id' => $newVariant->id,
                'condition' => $condition,
                'price_difference' => $priceDifference,
                'shipping_charge' => $shippingCharge,
                'balance_amount' => $balanceAmount,
                'notes' => $notes,
                'user_id' => auth()->id(),
            ]);

            $order->notes()->create([
                'user_id' => auth()->id(),
                'note' => sprintf(
                    'Exchanged %s EU %s → EU %s (%s). Balance: %s৳%d.',
                    $oldProductName,
                    $oldSize,
                    $newVariant->size,
                    $condition->label(),
                    $balanceAmount < 0 ? '-' : '',
                    abs($balanceAmount),
                ),
            ]);

            return $exchange;
        });
    }
}
