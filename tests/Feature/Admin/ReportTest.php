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
        ->has('statusBreakdown', 6)
        ->where('topProducts.0.product_name', 'Report Runner')
        ->where('topBrands.0.brand', 'Vint-Edge Originals'));
});

test('business report computes profit from purchase price, selling price, and courier cost', function () {
    $product = Product::factory()->create(['original_price' => 5000, 'purchase_price' => 3000]);
    $variant = ProductVariant::factory()->create(['product_id' => $product->id]);

    $order = Order::factory()->create([
        'status' => OrderStatus::Delivered,
        'delivery_fee' => 100,
        'actual_delivery_cost' => 120,
    ]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_variant_id' => $variant->id,
        'unit_price' => 5000,
        'quantity' => 2,
    ]);

    // No purchase price recorded — should not contribute to profit, and shouldn't error.
    $noCostProduct = Product::factory()->create(['purchase_price' => null]);
    $noCostVariant = ProductVariant::factory()->create(['product_id' => $noCostProduct->id]);
    $noCostOrder = Order::factory()->create([
        'status' => OrderStatus::Delivered,
        'actual_delivery_cost' => 50,
    ]);
    OrderItem::factory()->create([
        'order_id' => $noCostOrder->id,
        'product_variant_id' => $noCostVariant->id,
        'unit_price' => 4000,
        'quantity' => 1,
    ]);

    // Delivery cost not recorded yet — should not contribute to profit.
    $pendingOrder = Order::factory()->create(['status' => OrderStatus::Delivered, 'actual_delivery_cost' => null]);
    OrderItem::factory()->create([
        'order_id' => $pendingOrder->id,
        'product_variant_id' => $variant->id,
        'unit_price' => 5000,
        'quantity' => 1,
    ]);

    $response = $this->actingAs(adminUser())->get(route('admin.reports.index'));

    // ((5000 - 3000) * 2) - 120 = 3880. The no-purchase-price and no-delivery-cost
    // orders contribute nothing rather than being treated as zero-margin.
    $response->assertInertia(fn (Assert $page) => $page->where('kpis.total_profit', 3880));
});

test('the business report defaults to a 30-day monthly window', function () {
    $response = $this->actingAs(adminUser())->get(route('admin.reports.index'));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('range.value', 'month')
        ->has('trend', 30));
});

test('the business report can be scoped to a weekly window', function () {
    $response = $this->actingAs(adminUser())->get(route('admin.reports.index', ['range' => 'week']));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('range.value', 'week')
        ->has('trend', 7));
});

test('the business report can be scoped to a yearly window', function () {
    $response = $this->actingAs(adminUser())->get(route('admin.reports.index', ['range' => 'year']));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('range.value', 'year')
        ->has('trend', 365));
});

test('the business report can be scoped to a custom date range', function () {
    Order::factory()->create(['status' => OrderStatus::Delivered, 'total_amount' => 1000, 'created_at' => '2026-01-15']);
    Order::factory()->create(['status' => OrderStatus::Delivered, 'total_amount' => 2000, 'created_at' => '2026-03-01']);

    $response = $this->actingAs(adminUser())->get(route('admin.reports.index', [
        'range' => 'custom',
        'from' => '2026-01-01',
        'to' => '2026-01-31',
    ]));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('range.value', 'custom')
        ->where('kpis.total_orders', 1)
        ->where('kpis.total_revenue', 1000)
        ->has('trend', 31));
});

test('an invalid custom range falls back to the monthly window', function () {
    $response = $this->actingAs(adminUser())->get(route('admin.reports.index', [
        'range' => 'custom',
        'from' => '2026-05-01',
        'to' => '2026-01-01',
    ]));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('range.value', 'month')
        ->has('trend', 30));
});
