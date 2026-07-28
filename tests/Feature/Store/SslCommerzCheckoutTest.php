<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Http;

test('checking out with sslcommerz creates a pending order and redirects to the gateway', function () {
    Http::fake([
        '*/gwprocess/v4/api.php' => Http::response([
            'status' => 'SUCCESS',
            'GatewayPageURL' => 'https://sandbox.sslcommerz.com/fake-gateway',
        ]),
    ]);

    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);

    $this->post(route('cart.store'), ['variant_id' => $variant->id, 'quantity' => 1]);

    $response = $this->post(route('checkout.store'), [
        'customer_name' => 'Rahim Uddin',
        'phone_number' => '01712345678',
        'city' => 'Dhaka',
        'shipping_address' => 'Dhaka',
        'zone' => 'inside_dhaka',
        'payment_method' => 'sslcommerz',
    ]);

    $response->assertRedirect('https://sandbox.sslcommerz.com/fake-gateway');

    $order = Order::first();
    expect($order->payment_status)->toBe('pending');
    expect($order->payment_method)->toBe(\App\Enums\PaymentMethod::Sslcommerz);
    expect($variant->fresh()->stock_quantity)->toBe(4);
});

test('a validated sslcommerz success callback marks the order paid', function () {
    $order = Order::factory()->create([
        'status' => OrderStatus::Pending,
        'payment_status' => 'pending',
        'total_amount' => 5080,
    ]);

    Http::fake([
        '*/validator/api/validationserverAPI.php*' => Http::response([
            'status' => 'VALID',
            'tran_id' => $order->order_number,
            'amount' => '5080.00',
            'bank_tran_id' => 'BANK123',
        ]),
    ]);

    $response = $this->post(route('payments.sslcommerz.success'), [
        'tran_id' => $order->order_number,
        'val_id' => 'val-abc',
    ]);

    $response->assertRedirect(route('orders.success', $order));
    expect($order->fresh()->payment_status)->toBe('paid');
    expect($order->fresh()->payment_transaction_id)->toBe('BANK123');
});

test('a validated transaction for a different order or amount is rejected', function () {
    $order = Order::factory()->create([
        'status' => OrderStatus::Pending,
        'payment_status' => 'pending',
        'total_amount' => 5080,
    ]);

    Http::fake([
        '*/validator/api/validationserverAPI.php*' => Http::response([
            'status' => 'VALID',
            'tran_id' => 'SOMEONE-ELSES-ORDER',
            'amount' => '10.00',
            'bank_tran_id' => 'BANK999',
        ]),
    ]);

    $response = $this->post(route('payments.sslcommerz.success'), [
        'tran_id' => $order->order_number,
        'val_id' => 'val-from-a-different-transaction',
    ]);

    $response->assertRedirect(route('checkout.index'));
    expect($order->fresh()->payment_status)->toBe('failed');
    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled);
});

test('an sslcommerz fail callback marks the order failed and restocks its items', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 3]);
    $order = Order::factory()->create([
        'status' => OrderStatus::Pending,
        'payment_status' => 'pending',
    ]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_variant_id' => $variant->id,
        'quantity' => 2,
    ]);

    $response = $this->post(route('payments.sslcommerz.fail'), [
        'tran_id' => $order->order_number,
    ]);

    $response->assertRedirect(route('checkout.index'));
    expect($order->fresh()->payment_status)->toBe('failed');
    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled);
    expect($variant->fresh()->stock_quantity)->toBe(5);
});

test('an unvalidated sslcommerz success callback does not mark the order paid', function () {
    Http::fake([
        '*/validator/api/validationserverAPI.php*' => Http::response(['status' => 'FAILED']),
    ]);

    $order = Order::factory()->create([
        'status' => OrderStatus::Pending,
        'payment_status' => 'pending',
    ]);

    $this->post(route('payments.sslcommerz.success'), [
        'tran_id' => $order->order_number,
        'val_id' => 'val-abc',
    ]);

    expect($order->fresh()->payment_status)->toBe('failed');
    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled);
});
