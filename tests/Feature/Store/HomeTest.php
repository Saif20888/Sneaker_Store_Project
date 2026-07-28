<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Inertia\Testing\AssertableInertia as Assert;

test('home page renders best sellers, featured, and latest products', function () {
    $brand = Brand::factory()->create();
    $category = Category::factory()->create();

    $bestSeller = Product::factory()->trending()->create([
        'brand_id' => $brand->id,
        'category_id' => $category->id,
    ]);
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

test('home page only lists categories that have an image', function () {
    Category::factory()->create(['name' => 'With Image', 'image' => '/storage/categories/a.jpg']);
    Category::factory()->create(['name' => 'Without Image', 'image' => null]);

    $response = $this->get(route('home'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('home')
        ->has('categories', 1)
        ->where('categories.0.name', 'With Image'));
});
