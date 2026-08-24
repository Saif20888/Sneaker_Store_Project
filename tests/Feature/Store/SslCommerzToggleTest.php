<?php

use App\Models\ProductVariant;

test('sslcommerz is hidden from checkout payment methods when disabled', function () {
    config(['services.sslcommerz.enabled' => false]);

    $response = $this->get(route('checkout.index'));

    $response->assertInertia(fn ($page) => $page
        ->where('paymentMethods', fn ($methods) => collect($methods)
            ->doesntContain(fn ($method) => $method['value'] === 'sslcommerz')));
});

test('sslcommerz is offered at checkout when enabled', function () {
    config(['services.sslcommerz.enabled' => true]);

    $response = $this->get(route('checkout.index'));

    $response->assertInertia(fn ($page) => $page
        ->where('paymentMethods', fn ($methods) => collect($methods)
            ->contains(fn ($method) => $method['value'] === 'sslcommerz')));
});

test('checking out with sslcommerz is rejected when the gateway is disabled', function () {
    config(['services.sslcommerz.enabled' => false]);

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

    $response->assertSessionHasErrors('payment_method');
});
