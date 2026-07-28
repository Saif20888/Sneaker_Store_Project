<?php

namespace App\Support;

use App\Models\ProductVariant;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\ValidationException;

class Cart
{
    private const SESSION_KEY = 'cart';

    /**
     * Get the raw cart contents from the session.
     *
     * @return array<int, int> variant_id => quantity
     */
    public static function items(): array
    {
        return Session::get(self::SESSION_KEY, []);
    }

    /**
     * Add a variant to the cart, clamped to available stock and a max of 5.
     */
    public static function add(int $variantId, int $quantity): void
    {
        $variant = ProductVariant::findOrFail($variantId);

        if ($variant->stock_quantity <= 0) {
            throw ValidationException::withMessages([
                'variant_id' => 'This size is sold out.',
            ]);
        }

        $items = self::items();
        $current = $items[$variantId] ?? 0;
        $items[$variantId] = min($current + $quantity, $variant->stock_quantity, 5);

        Session::put(self::SESSION_KEY, $items);
    }

    /**
     * Set the exact quantity for a variant in the cart.
     */
    public static function update(int $variantId, int $quantity): void
    {
        $variant = ProductVariant::findOrFail($variantId);

        $items = self::items();
        $items[$variantId] = max(1, min($quantity, $variant->stock_quantity, 5));

        Session::put(self::SESSION_KEY, $items);
    }

    /**
     * Remove a variant from the cart.
     */
    public static function remove(int $variantId): void
    {
        $items = self::items();
        unset($items[$variantId]);

        Session::put(self::SESSION_KEY, $items);
    }

    /**
     * Empty the cart.
     */
    public static function clear(): void
    {
        Session::forget(self::SESSION_KEY);
    }

    /**
     * Build a frontend-ready cart summary hydrated with live product/variant data.
     *
     * @return array{items: array<int, array<string, mixed>>, count: int, subtotal: int}
     */
    public static function summary(): array
    {
        $items = self::items();

        if (empty($items)) {
            return ['items' => [], 'count' => 0, 'subtotal' => 0];
        }

        $variants = ProductVariant::query()
            ->with(['product.brand'])
            ->whereIn('id', array_keys($items))
            ->get()
            ->keyBy('id');

        $staleVariantIds = array_diff(array_keys($items), $variants->keys()->all());

        if ($staleVariantIds !== []) {
            foreach ($staleVariantIds as $staleVariantId) {
                unset($items[$staleVariantId]);
            }

            Session::put(self::SESSION_KEY, $items);
        }

        $lines = [];
        $subtotal = 0;
        $count = 0;

        foreach ($items as $variantId => $quantity) {
            /** @var ProductVariant|null $variant */
            $variant = $variants->get($variantId);

            if (! $variant) {
                continue;
            }

            $quantity = min($quantity, $variant->stock_quantity > 0 ? $variant->stock_quantity : $quantity);
            $unitPrice = $variant->product->currentPrice();
            $lineTotal = $unitPrice * $quantity;
            $subtotal += $lineTotal;
            $count += $quantity;

            $lines[] = [
                'variant_id' => $variant->id,
                'product_slug' => $variant->product->slug,
                'product_name' => $variant->product->name,
                'brand' => $variant->product->brand->name,
                'size' => $variant->size,
                'unit_price' => $unitPrice,
                'quantity' => $quantity,
                'stock_quantity' => $variant->stock_quantity,
                'image' => $variant->product->images[0] ?? null,
                'line_total' => $lineTotal,
            ];
        }

        return ['items' => $lines, 'count' => $count, 'subtotal' => $subtotal];
    }
}
