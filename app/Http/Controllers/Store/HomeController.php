<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\HomeBanner;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the storefront home page.
     */
    public function index(): Response
    {
        // "Best Sellers" surfaces the highest-stock in-stock products first, so the
        // storefront naturally pushes admins' deepest inventory to sell through.
        $bestSellers = Product::query()
            ->with(['brand', 'variants'])
            ->withSum('variants', 'stock_quantity')
            ->groupBy('products.id')
            ->having('variants_sum_stock_quantity', '>', 0)
            ->orderByDesc('variants_sum_stock_quantity')
            ->take(8)
            ->get()
            ->map(fn (Product $product) => $product->toCard());

        $featured = Product::query()
            ->with(['brand', 'variants'])
            ->where('is_featured', true)
            ->latest('release_date')
            ->take(4)
            ->get()
            ->map(fn (Product $product) => $product->toCard());

        $latest = Product::query()
            ->with(['brand', 'variants'])
            ->latest('created_at')
            ->take(8)
            ->get()
            ->map(fn (Product $product) => $product->toCard());

        $brands = Brand::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        return Inertia::render('home', [
            'bestSellers' => $bestSellers,
            'featured' => $featured,
            'latest' => $latest,
            'brands' => $brands,
            'banners' => HomeBanner::query()->orderBy('position')->pluck('image'),
            'categories' => Category::query()
                ->whereNotNull('image')
                ->orderBy('name')
                ->take(8)
                ->get(['name', 'slug', 'image']),
        ]);
    }
}
