<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Inertia\Testing\AssertableInertia as Assert;

test('home page renders best sellers, featured, and latest products', function () {
    $brand = Brand::factory()->create();
    $category = Category::factory()->create();

    $bestSeller = Product::factory()->create([
        'brand_id' => $brand->id,
        'category_id' => $category->id,
    ]);
    ProductVariant::factory()->create(['product_id' => $bestSeller->id, 'stock_quantity' => 20]);

    $featured = Product::factory()->featured()->create([
        'brand_id' => $brand->id,
        'category_id' => $category->id,
    ]);

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('home')
        ->has('bestSellers', 1, fn (Assert $page) => $page
            ->where('slug', $bestSeller->slug)
            ->etc())
        ->has('featured', 1, fn (Assert $page) => $page
            ->where('slug', $featured->slug)
            ->etc())
        ->has('latest', 2)
        ->has('brands', 1));
});

test('home page best sellers are ordered by total stock and exclude out-of-stock products', function () {
    $highStock = Product::factory()->create();
    ProductVariant::factory()->create(['product_id' => $highStock->id, 'stock_quantity' => 30]);

    $lowStock = Product::factory()->create();
    ProductVariant::factory()->create(['product_id' => $lowStock->id, 'stock_quantity' => 5]);

    $outOfStock = Product::factory()->create();
    ProductVariant::factory()->outOfStock()->create(['product_id' => $outOfStock->id]);

    $response = $this->get(route('home'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('home')
        ->has('bestSellers', 2)
        ->where('bestSellers.0.slug', $highStock->slug)
        ->where('bestSellers.1.slug', $lowStock->slug));
});

test('home page only lists categories that have an image', function () {
    Category::factory()->create(['name' => 'With Image', 'image' => '/storage/categories/a.jpg']);
    Category::factory()->create(['name' => 'Without Image', 'image' => null]);

    $response = $this->get(route('home'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('home')
        ->has('categories', 1)
        ->where('categories.0.name', 'With Image'));
});
