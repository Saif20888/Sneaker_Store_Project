<?php

use App\Models\Product;
use App\Models\ProductVariant;
use Inertia\Testing\AssertableInertia as Assert;

test('drops page lists recent products and flags limited stock', function () {
    $limited = Product::factory()->create(['release_date' => now()->subDay()]);
    ProductVariant::factory()->create(['product_id' => $limited->id, 'stock_quantity' => 2]);

    $plentiful = Product::factory()->create(['release_date' => now()->subDays(2)]);
    ProductVariant::factory()->create(['product_id' => $plentiful->id, 'stock_quantity' => 20]);

    $response = $this->get(route('drops.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('drops/index')
        ->has('products', 2)
        ->where('products.0.slug', $limited->slug)
        ->where('products.0.is_limited', true)
        ->where('products.1.is_limited', false));
});
