<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class DropsController extends Controller
{
    /**
     * Display the new arrivals / drops page.
     */
    public function index(): Response
    {
        $products = Product::query()
            ->with(['brand', 'variants'])
            ->latest('release_date')
            ->take(12)
            ->get()
            ->map(fn (Product $product) => [
                ...$product->toCard(),
                'is_limited' => $product->variants->contains(fn ($variant) => $variant->stock_quantity > 0 && $variant->stock_quantity <= 3),
            ]);

        return Inertia::render('drops/index', [
            'products' => $products,
        ]);
    }
}
