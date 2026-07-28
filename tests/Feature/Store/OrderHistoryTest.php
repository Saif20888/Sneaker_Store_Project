<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;

test('guests with no account and no guest cookie see an empty history', function () {
    $response = $this->get(route('orders.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('orders/index')
        ->has('orders', 0)
        ->where('guestId', null));
});

test('a guest sees their own orders via the guest id cookie', function () {
    $order = Order::factory()->create(['guest_id' => 'GST-TESTGUEST1']);
    OrderItem::factory()->create(['order_id' => $order->id]);

    Order::factory()->create(['guest_id' => 'GST-SOMEONEELSE']);

    $response = $this->withCookie('guest_id', 'GST-TESTGUEST1')->get(route('orders.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('orders/index')
        ->has('orders', 1)
        ->where('orders.0.order_number', $order->order_number)
        ->where('guestId', 'GST-TESTGUEST1'));
});

test('a customer only sees their own orders in their history', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $order = Order::factory()->create(['user_id' => $user->id]);
    OrderItem::factory()->create(['order_id' => $order->id]);

    Order::factory()->create(['user_id' => $otherUser->id]);
    Order::factory()->create(['user_id' => null]);

    $response = $this->actingAs($user)->get(route('orders.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('orders/index')
        ->has('orders', 1)
        ->where('orders.0.order_number', $order->order_number)
        ->where('orders.0.items_count', 1)
        ->where('guestId', null));
});

test('order history is empty for a customer with no linked orders', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('orders.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('orders/index')
        ->has('orders', 0));
});
