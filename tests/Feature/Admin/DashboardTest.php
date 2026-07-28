<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Inertia\Testing\AssertableInertia as Assert;

test('admin dashboard renders stats, recent orders, and low stock alerts', function () {
    $admin = adminUser();

    Order::factory()->count(2)->create(['status' => OrderStatus::Pending]);
    Order::factory()->create(['status' => OrderStatus::Processing]);

    $product = Product::factory()->create(['name' => 'Low Stock Runner']);
    ProductVariant::factory()->create([
        'product_id' => $product->id,
        'size' => '42',
        'stock_quantity' => 2,
    ]);

    $response = $this->actingAs($admin)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->where('stats.pending_orders', 2)
        ->where('stats.processing_orders', 1)
        ->has('recentOrders', 3)
        ->has('lowStockVariants', 1)
        ->where('lowStockVariants.0.product_name', 'Low Stock Runner'));
});
