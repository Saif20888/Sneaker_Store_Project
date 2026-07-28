<?php

use App\Models\Order;
use App\Models\OrderItem;
use Inertia\Testing\AssertableInertia as Assert;

test('order confirmation page renders the order and its items for the owning guest', function () {
    $order = Order::factory()->create(['guest_id' => 'GST-TESTOWNER1']);
    OrderItem::factory()->create(['order_id' => $order->id]);

    $response = $this->withCookie('guest_id', 'GST-TESTOWNER1')->get(route('orders.success', $order));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('orders/success')
        ->where('order.order_number', $order->order_number)
        ->has('order.items', 1));
});

test('order confirmation page renders for the owning signed-in user', function () {
    $user = \App\Models\User::factory()->create();
    $order = Order::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('orders.success', $order));

    $response->assertOk();
});

test('order confirmation page 404s for someone who does not own the order', function () {
    $order = Order::factory()->create(['guest_id' => 'GST-REALOWNER1']);

    $response = $this->get(route('orders.success', $order));

    $response->assertNotFound();
});

test('unknown order number returns a 404', function () {
    $response = $this->get('/orders/success/does-not-exist');

    $response->assertNotFound();
});
