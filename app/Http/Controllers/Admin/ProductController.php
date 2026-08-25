<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Brand;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display the admin product catalog, filterable by search term, category, and brand.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('q')->trim()->toString();
        $categoryId = $request->integer('category');
        $brandId = $request->integer('brand');

        $products = Product::query()
            ->with(['brand', 'category', 'variants'])
            ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
            ->when($brandId, fn ($query) => $query->where('brand_id', $brandId))
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'slug' => $product->slug,
                'name' => $product->name,
                'brand' => $product->brand->name,
                'category' => $product->category->name,
                'original_price' => $product->original_price,
                'discount_price' => $product->discount_price,
                'image' => $product->images[0] ?? null,
                'total_stock' => $product->variants->sum('stock_quantity'),
                'is_featured' => $product->is_featured,
            ]);

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'filters' => [
                'q' => $search,
                'category' => $categoryId ?: null,
                'brand' => $brandId ?: null,
            ],
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'brands' => Brand::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Display the form for creating a new product.
     */
    public function create(): Response
    {
        return Inertia::render('admin/products/create', [
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'brands' => Brand::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $product = Product::query()->create([
                ...$request->safe()->except(['images', 'variants']),
                'images' => $this->storeUploadedImages($request->file('images', [])),
            ]);

            foreach ($request->validated('variants') as $variant) {
                $product->variants()->create($variant);
            }
        });

        return to_route('admin.products.index')->with('status', 'Product created.');
    }

    /**
     * Display the form for editing the given product.
     */
    public function edit(Product $product): Response
    {
        $product->load('variants');

        return Inertia::render('admin/products/edit', [
            'product' => [
                'id' => $product->id,
                'slug' => $product->slug,
                'name' => $product->name,
                'category_id' => $product->category_id,
                'brand_id' => $product->brand_id,
                'description' => $product->description,
                'original_price' => $product->original_price,
                'purchase_price' => $product->purchase_price,
                'discount_price' => $product->discount_price,
                'discount_percentage' => $product->discount_percentage,
                'is_featured' => $product->is_featured,
                'release_date' => $product->release_date?->toDateString(),
                'images' => $product->images ?? [],
                'variants' => $product->variants->map(fn ($variant) => [
                    'id' => $variant->id,
                    'size' => $variant->size,
                    'stock_quantity' => $variant->stock_quantity,
                ]),
            ],
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'brands' => Brand::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Update the given product.
     */
    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        DB::transaction(function () use ($request, $product) {
            // Only keep submitted "existing" image paths that actually belong to this
            // product, so a tampered request can't graft an unrelated image path in.
            $existingImages = array_values(array_intersect(
                $request->validated('existing_images', []),
                $product->images ?? [],
            ));

            $images = $this->mergeImagesByOrder(
                existingImages: $existingImages,
                newImages: $this->storeUploadedImages($request->file('images', [])),
                order: $request->validated('image_order', []),
            );

            $this->deleteStoredImages(array_diff($product->images ?? [], $images));

            $product->update([
                ...$request->safe()->except(['images', 'existing_images', 'variants']),
                'images' => $images,
            ]);

            $submittedVariants = collect((array) $request->validated('variants'));
            $submittedIds = $submittedVariants->pluck('id')->filter()->all();

            $product->variants()
                ->whereNotIn('id', $submittedIds)
                ->whereDoesntHave('orderItems')
                ->delete();

            foreach ($submittedVariants as $variant) {
                $product->variants()->updateOrCreate(
                    ['id' => $variant['id'] ?? null],
                    ['size' => $variant['size'], 'stock_quantity' => $variant['stock_quantity']],
                );
            }
        });

        return to_route('admin.products.index')->with('status', 'Product updated.');
    }

    /**
     * Delete the given product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $hasOrders = OrderItem::query()
            ->whereIn('product_variant_id', $product->variants()->pluck('id'))
            ->exists();

        if ($hasOrders) {
            return back()->with('error', 'This product has existing orders and cannot be deleted.');
        }

        $this->deleteStoredImages($product->images ?? []);
        $product->delete();

        return to_route('admin.products.index')->with('status', 'Product deleted.');
    }

    /**
     * Merge the kept existing images and newly uploaded images into a single
     * list, honoring the admin's chosen display order (which image is main).
     *
     * @param  array<int, string>  $existingImages
     * @param  array<int, string>  $newImages
     * @param  array<int, string>  $order
     * @return array<int, string>
     */
    private function mergeImagesByOrder(array $existingImages, array $newImages, array $order): array
    {
        if ($order === []) {
            return [...$existingImages, ...$newImages];
        }

        $existingQueue = collect($existingImages);
        $newQueue = collect($newImages);

        return collect($order)
            ->map(fn (string $kind) => $kind === 'existing' ? $existingQueue->shift() : $newQueue->shift())
            ->filter()
            ->values()
            ->all();
    }

    /**
     * Store uploaded image files on the public disk and return their public URLs.
     *
     * @param  array<int, UploadedFile>  $files
     * @return array<int, string>
     */
    private function storeUploadedImages(array $files): array
    {
        return collect($files)
            ->map(fn (UploadedFile $file) => '/storage/'.$file->store('products', 'public'))
            ->all();
    }

    /**
     * Delete the given previously stored product images from disk.
     *
     * @param  array<int, string>  $images
     */
    private function deleteStoredImages(array $images): void
    {
        foreach ($images as $image) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $image));
        }
    }
}
