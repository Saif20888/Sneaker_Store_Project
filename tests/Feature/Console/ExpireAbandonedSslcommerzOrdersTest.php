<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;

test('it cancels and restocks sslcommerz orders left pending past the expiry window', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 3]);
    $order = Order::factory()->create([
        'payment_method' => 'sslcommerz',
        'payment_status' => 'pending',
        'status' => OrderStatus::Pending,
        'created_at' => now()->subHours(2),
    ]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_variant_id' => $variant->id,
        'quantity' => 2,
    ]);

    $this->artisan('app:expire-abandoned-sslcommerz-orders')->assertSuccessful();

    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled);
    expect($order->fresh()->payment_status)->toBe('failed');
    expect($variant->fresh()->stock_quantity)->toBe(5);
});

test('it leaves recent pending sslcommerz orders alone', function () {
    $order = Order::factory()->create([
        'payment_method' => 'sslcommerz',
        'payment_status' => 'pending',
        'status' => OrderStatus::Pending,
        'created_at' => now()->subMinutes(5),
    ]);

    $this->artisan('app:expire-abandoned-sslcommerz-orders');

    expect($order->fresh()->status)->toBe(OrderStatus::Pending);
});

test('it leaves already-paid sslcommerz orders alone', function () {
    $order = Order::factory()->create([
        'payment_method' => 'sslcommerz',
        'payment_status' => 'paid',
        'status' => OrderStatus::Processing,
        'created_at' => now()->subHours(2),
    ]);

    $this->artisan('app:expire-abandoned-sslcommerz-orders');

    expect($order->fresh()->status)->toBe(OrderStatus::Processing);
});
