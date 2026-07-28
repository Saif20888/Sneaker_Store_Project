<?php

use App\Enums\OrderStatus;
use App\Models\Brand;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access the business report', function () {
    $this->get(route('admin.reports.index'))->assertRedirect(route('login'));
});

test('non-admin users cannot access the business report', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.reports.index'))->assertForbidden();
});

test('business report aggregates revenue, status counts, and top sellers', function () {
    $brand = Brand::factory()->create(['name' => 'Vint-Edge Originals']);
    $product = Product::factory()->create([
        'brand_id' => $brand->id,
        'name' => 'Report Runner',
        'original_price' => 5000,
        'discount_price' => null,
    ]);
    $variant = ProductVariant::factory()->create(['product_id' => $product->id]);

    $order = Order::factory()->create(['status' => OrderStatus::Delivered, 'total_amount' => 5080]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_variant_id' => $variant->id,
        'product_name' => 'Report Runner',
        'unit_price' => 5000,
        'quantity' => 1,
    ]);

    Order::factory()->create(['status' => OrderStatus::Cancelled]);

    $response = $this->actingAs(adminUser())->get(route('admin.reports.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/reports/index')
        ->where('kpis.total_orders', 2)
        ->has('trend', 30)
        ->has('statusBreakdown', 5)
        ->where('topProducts.0.product_name', 'Report Runner')
        ->where('topBrands.0.brand', 'Vint-Edge Originals'));
});
