<?php

use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;

test('checkout page renders delivery zones and payment methods', function () {
    $response = $this->get(route('checkout.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('checkout')
        ->has('zones', 2)
        ->has('paymentMethods', 4));
});

test('guests can check out without an account', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);

    $this->post(route('cart.store'), ['variant_id' => $variant->id, 'quantity' => 1]);

    $response = $this->post(route('checkout.store'), [
        'customer_name' => 'Guest Buyer',
        'phone_number' => '01712345678',
        'city' => 'Dhaka',
        'shipping_address' => 'House 1, Road 1',
        'zone' => 'inside_dhaka',
        'payment_method' => 'cod',
    ]);

    $response->assertRedirect(route('orders.success', Order::first()));
    expect(Order::count())->toBe(1);
});

test('placing an order creates the order, decrements stock, and redirects to confirmation', function () {
    $product = Product::factory()->create(['original_price' => 5000]);
    $variant = ProductVariant::factory()->create([
        'product_id' => $product->id,
        'size' => '42',
        'stock_quantity' => 5,
    ]);

    $this->post(route('cart.store'), ['variant_id' => $variant->id, 'quantity' => 2]);

    $response = $this->post(route('checkout.store'), [
        'customer_name' => 'Rahim Uddin',
        'phone_number' => '01712345678',
        'city' => 'Dhaka',
        'shipping_address' => 'House 12, Road 5, Dhanmondi',
        'zone' => 'inside_dhaka',
        'payment_method' => 'cod',
    ]);

    $order = Order::first();

    $response->assertRedirect(route('orders.success', $order));

    expect($order)->not->toBeNull();
    expect($order->customer_name)->toBe('Rahim Uddin');
    expect($order->city)->toBe('Dhaka');
    expect($order->zone->value)->toBe('inside_dhaka');
    expect($order->delivery_fee)->toBe(80);
    expect($order->subtotal)->toBe(10000);
    expect($order->total_amount)->toBe(10080);
    expect($order->source)->toBe(OrderSource::Website);
    expect($order->status)->toBe(OrderStatus::Pending);
    expect($order->items)->toHaveCount(1);
    expect($order->items->first()->quantity)->toBe(2);

    expect($variant->fresh()->stock_quantity)->toBe(3);

    // The session cart is cleared after a successful checkout.
    $this->get(route('cart.index'));
    expect(session('cart', []))->toBe([]);
});

test('placing an order outside dhaka charges the higher delivery fee', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);
    $product = $variant->product;

    $this->post(route('cart.store'), ['variant_id' => $variant->id, 'quantity' => 1]);

    $this->post(route('checkout.store'), [
        'customer_name' => 'Karim Ahmed',
        'phone_number' => '01812345678',
        'city' => 'Chittagong',
        'shipping_address' => 'Agrabad',
        'zone' => 'outside_dhaka',
        'payment_method' => 'bkash',
        'payment_transaction_id' => '8N7A6XYZ12',
    ]);

    $order = Order::first();

    expect($order->delivery_fee)->toBe(150);
    expect($order->total_amount)->toBe($product->currentPrice() + 150);
    expect($order->payment_transaction_id)->toBe('8N7A6XYZ12');
});

test('bkash checkout requires a transaction id', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);

    $this->post(route('cart.store'), ['variant_id' => $variant->id, 'quantity' => 1]);

    $response = $this->post(route('checkout.store'), [
        'customer_name' => 'Karim Ahmed',
        'phone_number' => '01812345678',
        'city' => 'Chittagong',
        'shipping_address' => 'Agrabad',
        'zone' => 'outside_dhaka',
        'payment_method' => 'bkash',
    ]);

    $response->assertSessionHasErrors('payment_transaction_id');
    expect(Order::count())->toBe(0);
});

test('checkout fails when the cart is empty', function () {
    $response = $this->post(route('checkout.store'), [
        'customer_name' => 'Rahim Uddin',
        'phone_number' => '01712345678',
        'city' => 'Dhaka',
        'shipping_address' => 'Dhaka',
        'zone' => 'inside_dhaka',
        'payment_method' => 'cod',
    ]);

    $response->assertSessionHasErrors('items');
    expect(Order::count())->toBe(0);
});

test('checkout fails if stock drops below the cart quantity before the order is placed', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 3]);

    $this->post(route('cart.store'), ['variant_id' => $variant->id, 'quantity' => 3]);

    // Simulate another customer buying the remaining stock between add-to-cart and checkout.
    $variant->update(['stock_quantity' => 1]);

    $response = $this->post(route('checkout.store'), [
        'customer_name' => 'Rahim Uddin',
        'phone_number' => '01712345678',
        'city' => 'Dhaka',
        'shipping_address' => 'Dhaka',
        'zone' => 'inside_dhaka',
        'payment_method' => 'cod',
    ]);

    $response->assertSessionHasErrors('items');
    expect(Order::count())->toBe(0);
    expect($variant->fresh()->stock_quantity)->toBe(1);
});

test('checkout links the order to the signed-in customer\'s account', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);

    $this->actingAs($user)->post(route('cart.store'), ['variant_id' => $variant->id, 'quantity' => 1]);

    $this->actingAs($user)->post(route('checkout.store'), [
        'customer_name' => 'Rahim Uddin',
        'phone_number' => '01712345678',
        'city' => 'Dhaka',
        'shipping_address' => 'Dhaka',
        'zone' => 'inside_dhaka',
        'payment_method' => 'cod',
    ]);

    expect(Order::first()->user_id)->toBe($user->id);
});

test('guest checkout leaves the order unlinked to any account', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);

    $this->post(route('cart.store'), ['variant_id' => $variant->id, 'quantity' => 1]);

    $this->post(route('checkout.store'), [
        'customer_name' => 'Rahim Uddin',
        'phone_number' => '01712345678',
        'city' => 'Dhaka',
        'shipping_address' => 'Dhaka',
        'zone' => 'inside_dhaka',
        'payment_method' => 'cod',
    ]);

    expect(Order::first()->user_id)->toBeNull();
});

test('guest checkout sets a persistent guest id cookie and reuses it on a second order', function () {
    $variantOne = ProductVariant::factory()->create(['stock_quantity' => 5]);
    $variantTwo = ProductVariant::factory()->create(['stock_quantity' => 5]);

    $this->post(route('cart.store'), ['variant_id' => $variantOne->id, 'quantity' => 1]);
    $firstResponse = $this->post(route('checkout.store'), [
        'customer_name' => 'Rahim Uddin',
        'phone_number' => '01712345678',
        'city' => 'Dhaka',
        'shipping_address' => 'Dhaka',
        'zone' => 'inside_dhaka',
        'payment_method' => 'cod',
    ]);

    $guestId = $firstResponse->getCookie('guest_id')->getValue();

    expect($guestId)->toStartWith('GST-');

    $this->withCookie('guest_id', $guestId)->post(route('cart.store'), ['variant_id' => $variantTwo->id, 'quantity' => 1]);
    $this->withCookie('guest_id', $guestId)->post(route('checkout.store'), [
        'customer_name' => 'Rahim Uddin',
        'phone_number' => '01712345678',
        'city' => 'Dhaka',
        'shipping_address' => 'Dhaka',
        'zone' => 'inside_dhaka',
        'payment_method' => 'cod',
    ]);

    expect(Order::where('guest_id', $guestId)->count())->toBe(2);
});

test('checkout requires a valid bangladeshi phone number', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);

    $this->post(route('cart.store'), ['variant_id' => $variant->id, 'quantity' => 1]);

    $response = $this->post(route('checkout.store'), [
        'customer_name' => 'Rahim Uddin',
        'phone_number' => '12345',
        'city' => 'Dhaka',
        'shipping_address' => 'Dhaka',
        'zone' => 'inside_dhaka',
        'payment_method' => 'cod',
    ]);

    $response->assertSessionHasErrors('phone_number');
});
