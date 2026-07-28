<?php

use App\Models\Product;
use App\Models\ProductVariant;
use Inertia\Testing\AssertableInertia as Assert;

test('product page renders product details and size variants', function () {
    $product = Product::factory()->create();
    ProductVariant::factory()->create(['product_id' => $product->id, 'size' => '42', 'stock_quantity' => 5]);
    ProductVariant::factory()->create(['product_id' => $product->id, 'size' => '43', 'stock_quantity' => 0]);

    $response = $this->get(route('products.show', $product));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('products/show')
        ->where('product.slug', $product->slug)
        ->has('product.variants', 2));
});

test('unknown product returns a 404', function () {
    $response = $this->get('/sneakers/does-not-exist');

    $response->assertNotFound();
});
