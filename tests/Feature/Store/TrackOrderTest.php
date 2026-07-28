<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use Inertia\Testing\AssertableInertia as Assert;

test('track order page renders the empty lookup form', function () {
    $response = $this->get(route('track-order.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('track-order')
        ->missing('order'));
});

test('looking up a valid order number and phone shows the tracking timeline', function () {
    $order = Order::factory()->create([
        'phone_number' => '01712345678',
        'status' => OrderStatus::Shipped,
    ]);

    $response = $this->get(route('track-order.index', [
        'order_number' => $order->order_number,
        'phone_number' => '01712345678',
    ]));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('track-order')
        ->where('order.order_number', $order->order_number)
        ->where('order.status_label', 'Out for Delivery')
        ->where('order.tracking_step', 3)
        ->where('notFound', false));
});

test('looking up with a mismatched phone number reports not found', function () {
    $order = Order::factory()->create(['phone_number' => '01712345678']);

    $response = $this->get(route('track-order.index', [
        'order_number' => $order->order_number,
        'phone_number' => '01999999999',
    ]));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('track-order')
        ->where('notFound', true)
        ->missing('order.order_number'));
});
