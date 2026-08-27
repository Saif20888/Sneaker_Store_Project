<?php

use App\Enums\DiscountType;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Inertia\Testing\AssertableInertia as Assert;

test('catalog page lists all products', function () {
    Product::factory()->count(3)->create();

    $response = $this->get(route('products.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('shop/index')
        ->has('products', 3)
        ->has('brands')
        ->has('sizes', 6));
});

test('catalog can be filtered by brand', function () {
    $nike = Brand::factory()->create(['name' => 'Nike', 'slug' => 'nike']);
    $adidas = Brand::factory()->create(['name' => 'Adidas', 'slug' => 'adidas']);

    Product::factory()->create(['brand_id' => $nike->id, 'name' => 'Nike Shoe']);
    Product::factory()->create(['brand_id' => $adidas->id, 'name' => 'Adidas Shoe']);

    $response = $this->get(route('products.index', ['brand' => 'nike']));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('shop/index')
        ->has('products', 1)
        ->where('products.0.brand', 'Nike'));
});

test('catalog can be filtered by category', function () {
    $sneakers = Category::factory()->create(['name' => 'Sneakers', 'slug' => 'sneakers']);
    $wallets = Category::factory()->create(['name' => 'Wallets', 'slug' => 'wallets']);

    Product::factory()->create(['category_id' => $sneakers->id, 'name' => 'Air Max']);
    Product::factory()->create(['category_id' => $wallets->id, 'name' => 'Leather Wallet']);

    $response = $this->get(route('products.index', ['category' => 'sneakers']));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('shop/index')
        ->has('products', 1)
        ->where('products.0.name', 'Air Max'));
});

test('catalog can be filtered by size', function () {
    $withSize = Product::factory()->create();
    ProductVariant::factory()->create(['product_id' => $withSize->id, 'size' => '42']);

    $withoutSize = Product::factory()->create();
    ProductVariant::factory()->create(['product_id' => $withoutSize->id, 'size' => '44']);

    $response = $this->get(route('products.index', ['size' => '42']));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('shop/index')
        ->has('products', 1)
        ->where('products.0.slug', $withSize->slug));
});

test('catalog can be filtered by price range', function () {
    Product::factory()->create(['original_price' => 5000]);
    Product::factory()->create(['original_price' => 20000]);

    $response = $this->get(route('products.index', ['min_price' => 10000]));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('shop/index')
        ->has('products', 1));
});

test('catalog can be searched by name', function () {
    Product::factory()->create(['name' => 'Air Jordan 1']);
    Product::factory()->create(['name' => 'New Balance 550']);

    $response = $this->get(route('products.index', ['q' => 'Jordan']));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('shop/index')
        ->has('products', 1)
        ->where('products.0.name', 'Air Jordan 1'));
});

test('catalog can be sorted by price ascending', function () {
    Product::factory()->create(['name' => 'Expensive', 'original_price' => 20000]);
    Product::factory()->create(['name' => 'Cheap', 'original_price' => 5000]);

    $response = $this->get(route('products.index', ['sort' => 'price_asc']));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('shop/index')
        ->where('products.0.name', 'Cheap'));
});

test('catalog can be filtered to in-stock only', function () {
    $inStock = Product::factory()->create();
    ProductVariant::factory()->create(['product_id' => $inStock->id, 'stock_quantity' => 5]);

    $outOfStock = Product::factory()->create();
    ProductVariant::factory()->create(['product_id' => $outOfStock->id, 'stock_quantity' => 0]);

    $response = $this->get(route('products.index', ['in_stock' => '1']));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('shop/index')
        ->has('products', 1)
        ->where('products.0.slug', $inStock->slug));
});

test('catalog can be filtered to discounted products only', function () {
    $discounted = Product::factory()->create(['original_price' => 5000, 'discount_price' => 3500, 'discount_percentage' => 30]);
    Product::factory()->create(['original_price' => 5000, 'discount_price' => null, 'discount_percentage' => null]);

    $response = $this->get(route('products.index', ['discounted' => '1']));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('shop/index')
        ->has('products', 1)
        ->where('products.0.slug', $discounted->slug)
        ->where('products.0.discount_price', 3500));
});

test('a product card exposes its discount type for the flat-vs-percentage badge', function () {
    $flat = Product::factory()->create([
        'original_price' => 5000,
        'discount_price' => 4500,
        'discount_percentage' => 10,
        'discount_type' => DiscountType::Flat,
    ]);

    $response = $this->get(route('products.index'));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('products.0.slug', $flat->slug)
        ->where('products.0.discount_type', 'flat'));
});
