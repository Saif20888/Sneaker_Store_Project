<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $category_id
 * @property int $brand_id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property int $original_price
 * @property int|null $purchase_price
 * @property int|null $discount_price
 * @property float|null $discount_percentage
 * @property array<int, string>|null $images
 * @property array<int, array{size: string, us: string, uk: string, cm: string}>|null $size_chart
 * @property bool $is_featured
 * @property bool $is_trending
 * @property Carbon|null $release_date
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Category $category
 * @property-read Brand $brand
 * @property-read Collection<int, ProductVariant> $variants
 */
#[Fillable(['category_id', 'brand_id', 'name', 'slug', 'description', 'original_price', 'purchase_price', 'discount_price', 'discount_percentage', 'images', 'size_chart', 'is_featured', 'is_trending', 'release_date'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    /**
     * Get the category this product belongs to.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the brand this product belongs to.
     *
     * @return BelongsTo<Brand, $this>
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * Get the size variants for this product.
     *
     * @return HasMany<ProductVariant, $this>
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Determine if the product is in stock across any variant.
     */
    public function isInStock(): bool
    {
        return $this->variants->sum('stock_quantity') > 0;
    }

    /**
     * Determine if the product is currently discounted.
     */
    public function isDiscounted(): bool
    {
        return $this->discount_price !== null && $this->discount_price < $this->original_price;
    }

    /**
     * Get the price a customer actually pays: the discount price if one is active, otherwise the original price.
     */
    public function currentPrice(): int
    {
        return $this->isDiscounted() ? $this->discount_price : $this->original_price;
    }

    /**
     * Present this product as a card-friendly array shape.
     *
     * @return array{id: int, slug: string, name: string, brand: string, original_price: int, discount_price: int|null, discount_percentage: float|null, images: array<int, string>|null, is_in_stock: bool}
     */
    public function toCard(): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'brand' => $this->brand->name,
            'original_price' => $this->original_price,
            'discount_price' => $this->isDiscounted() ? $this->discount_price : null,
            'discount_percentage' => $this->isDiscounted() ? $this->discount_percentage : null,
            'images' => $this->images,
            'is_in_stock' => $this->isInStock(),
        ];
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'images' => 'array',
            'size_chart' => 'array',
            'is_featured' => 'boolean',
            'is_trending' => 'boolean',
            'release_date' => 'date',
            'discount_percentage' => 'float',
        ];
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
