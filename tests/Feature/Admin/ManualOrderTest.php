<?php

use App\Enums\OrderSource;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;

test('guests cannot access manual order routes', function () {
    $this->get(route('admin.orders.create'))->assertRedirect(route('login'));
    $this->post(route('admin.orders.store'), [])->assertRedirect(route('login'));
});

test('non-admin users cannot access manual order routes', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.orders.create'))->assertForbidden();
    $this->actingAs($user)->post(route('admin.orders.store'), [])->assertForbidden();
});

test('admin can create a manual order from a chat conversation', function () {
    $variant = ProductVariant::factory()->create(['size' => '42', 'stock_quantity' => 5]);
    $admin = adminUser();

    $response = $this->actingAs($admin)->post(route('admin.orders.store'), [
        'customer_name' => 'Rahim Uddin',
        'phone_number' => '01712345678',
        'city' => 'Dhaka',
        'shipping_address' => 'House 1, Road 1',
        'zone' => 'inside_dhaka',
        'source' => 'messenger',
        'payment_method' => 'cod',
        'payment_status' => 'pending',
        'items' => [
            ['product_variant_id' => $variant->id, 'quantity' => 2],
        ],
    ]);

    $order = Order::first();

    $response->assertRedirect(route('admin.orders.show', $order));
    expect($order)->not->toBeNull();
    expect($order->source)->toBe(OrderSource::Messenger);
    expect($order->payment_status)->toBe('pending');
    expect($order->user_id)->toBeNull();
    expect($order->guest_id)->toBeNull();
    expect($order->items)->toHaveCount(1);
    expect($order->items->first()->quantity)->toBe(2);
    expect($variant->fresh()->stock_quantity)->toBe(3);

    $note = $order->notes()->first();
    expect($note)->not->toBeNull();
    expect($note->note)->toBe('Order created manually via Messenger.');
    expect($note->user_id)->toBe($admin->id);
});

test('manual orders can be marked paid via bkash with a transaction id', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);

    $response = $this->actingAs(adminUser())->post(route('admin.orders.store'), [
        'customer_name' => 'Karim Ahmed',
        'phone_number' => '01812345678',
        'city' => 'Dhaka',
        'shipping_address' => 'House 2',
        'zone' => 'inside_dhaka',
        'source' => 'whatsapp',
        'payment_method' => 'bkash',
        'payment_transaction_id' => '8N7A6XYZ12',
        'payment_status' => 'paid',
        'items' => [
            ['product_variant_id' => $variant->id, 'quantity' => 1],
        ],
    ]);

    $response->assertRedirect(route('admin.orders.show', Order::first()));

    $order = Order::first();
    expect($order->source)->toBe(OrderSource::Whatsapp);
    expect($order->payment_status)->toBe('paid');
    expect($order->payment_transaction_id)->toBe('8N7A6XYZ12');
});

test('sslcommerz is rejected as a manual order payment method', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);

    $response = $this->actingAs(adminUser())->post(route('admin.orders.store'), [
        'customer_name' => 'Karim Ahmed',
        'phone_number' => '01812345678',
        'city' => 'Dhaka',
        'shipping_address' => 'House 2',
        'zone' => 'inside_dhaka',
        'source' => 'phone',
        'payment_method' => 'sslcommerz',
        'items' => [
            ['product_variant_id' => $variant->id, 'quantity' => 1],
        ],
    ]);

    $response->assertSessionHasErrors('payment_method');
    expect(Order::count())->toBe(0);
});

test('a manual order requires at least one item', function () {
    $response = $this->actingAs(adminUser())->post(route('admin.orders.store'), [
        'customer_name' => 'Karim Ahmed',
        'phone_number' => '01812345678',
        'city' => 'Dhaka',
        'shipping_address' => 'House 2',
        'zone' => 'inside_dhaka',
        'source' => 'phone',
        'payment_method' => 'cod',
        'items' => [],
    ]);

    $response->assertSessionHasErrors('items');
    expect(Order::count())->toBe(0);
});

test('a manual order requires a valid bangladeshi phone number', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);

    $response = $this->actingAs(adminUser())->post(route('admin.orders.store'), [
        'customer_name' => 'Karim Ahmed',
        'phone_number' => '12345',
        'city' => 'Dhaka',
        'shipping_address' => 'House 2',
        'zone' => 'inside_dhaka',
        'source' => 'phone',
        'payment_method' => 'cod',
        'items' => [
            ['product_variant_id' => $variant->id, 'quantity' => 1],
        ],
    ]);

    $response->assertSessionHasErrors('phone_number');
    expect(Order::count())->toBe(0);
});
