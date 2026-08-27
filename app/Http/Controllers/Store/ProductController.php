<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Available EU sizes for the size filter.
     *
     * @var array<int, string>
     */
    private const SIZES = ['40', '41', '42', '43', '44', '45'];

    /**
     * Display the product catalog with filtering, search, and sorting.
     */
    public function index(Request $request): Response
    {
        $query = Product::query()->with(['brand', 'variants']);

        $brandSlugs = array_filter((array) $request->input('brand', []));

        if (! empty($brandSlugs)) {
            $query->whereHas('brand', fn ($brands) => $brands->whereIn('slug', $brandSlugs));
        }

        $categorySlugs = array_filter((array) $request->input('category', []));

        if (! empty($categorySlugs)) {
            $query->whereHas('category', fn ($categories) => $categories->whereIn('slug', $categorySlugs));
        }

        if ($request->filled('size')) {
            $query->whereHas('variants', fn ($variants) => $variants->where('size', $request->string('size')));
        }

        if ($request->filled('min_price')) {
            $query->whereRaw('COALESCE(discount_price, original_price) >= ?', [(int) $request->input('min_price')]);
        }

        if ($request->filled('max_price')) {
            $query->whereRaw('COALESCE(discount_price, original_price) <= ?', [(int) $request->input('max_price')]);
        }

        if ($request->filled('q')) {
            $query->where('name', 'like', '%'.$request->string('q').'%');
        }

        if ($request->boolean('in_stock')) {
            $query->whereHas('variants', fn ($variants) => $variants->where('stock_quantity', '>', 0));
        }

        if ($request->boolean('discounted')) {
            $query->whereNotNull('discount_price');
        }

        match ($request->string('sort')->value()) {
            'price_asc' => $query->orderByRaw('COALESCE(discount_price, original_price) asc'),
            'price_desc' => $query->orderByRaw('COALESCE(discount_price, original_price) desc'),
            'newest' => $query->orderByDesc('release_date'),
            default => $query->orderByDesc('is_trending')->orderByDesc('release_date'),
        };

        $products = $query->get()->map(fn (Product $product) => $product->toCard());

        return Inertia::render('shop/index', [
            'products' => $products,
            'brands' => Brand::query()->orderBy('name')->get(['id', 'name', 'slug']),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name', 'slug']),
            'sizes' => self::SIZES,
            'filters' => $request->only(['brand', 'category', 'size', 'min_price', 'max_price', 'q', 'sort', 'in_stock', 'discounted']),
        ]);
    }

    /**
     * Display the given product.
     */
    public function show(Product $product): Response
    {
        $product->load(['brand', 'category', 'variants' => fn ($query) => $query->orderBy('size')]);

        $related = Product::query()
            ->with(['brand', 'variants'])
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->take(4)
            ->get()
            ->map(fn (Product $related) => $related->toCard());

        return Inertia::render('products/show', [
            'product' => $this->presentDetail($product),
            'related' => $related,
        ]);
    }

    /**
     * Return product detail data as JSON for the quick-view modal.
     */
    public function quickView(Product $product): JsonResponse
    {
        $product->load(['brand', 'category', 'variants' => fn ($query) => $query->orderBy('size')]);

        return response()->json($this->presentDetail($product));
    }

    /**
     * Build the detail array shared by the full product page and the quick-view modal.
     *
     * @return array<string, mixed>
     */
    private function presentDetail(Product $product): array
    {
        return [
            'id' => $product->id,
            'slug' => $product->slug,
            'name' => $product->name,
            'description' => $product->description,
            'original_price' => $product->original_price,
            'discount_price' => $product->isDiscounted() ? $product->discount_price : null,
            'discount_percentage' => $product->isDiscounted() ? $product->discount_percentage : null,
            'images' => $product->images,
            'size_chart' => $product->size_chart,
            'brand' => $product->brand->name,
            'category' => $product->category->name,
            'release_date' => $product->release_date?->toDateString(),
            'variants' => $product->variants->map(fn ($variant) => [
                'id' => $variant->id,
                'size' => $variant->size,
                'stock_quantity' => $variant->stock_quantity,
            ]),
        ];
    }
}
