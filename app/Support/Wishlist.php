<?php

namespace App\Support;

use App\Models\Product;
use App\Models\Wishlist as WishlistModel;
use Illuminate\Support\Facades\Auth;

class Wishlist
{
    /**
     * Get the wishlisted product IDs for the current user, or an empty array for guests.
     *
     * @return array<int, int>
     */
    public static function ids(): array
    {
        $userId = Auth::id();

        if (! $userId) {
            return [];
        }

        return WishlistModel::query()
            ->where('user_id', $userId)
            ->pluck('product_id')
            ->all();
    }

    /**
     * Toggle a product in the current user's wishlist. Returns true if it is now wishlisted, false if removed.
     */
    public static function toggle(int $productId): bool
    {
        $userId = Auth::id();

        $existing = WishlistModel::query()
            ->where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            $existing->delete();

            return false;
        }

        WishlistModel::query()->create([
            'user_id' => $userId,
            'product_id' => $productId,
        ]);

        return true;
    }

    /**
     * Build a frontend-ready list of wishlisted products for the current user.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function items(): array
    {
        $ids = self::ids();

        if (empty($ids)) {
            return [];
        }

        return Product::query()
            ->with(['brand', 'variants'])
            ->whereIn('id', $ids)
            ->get()
            ->map(fn (Product $product) => $product->toCard())
            ->values()
            ->all();
    }
}
