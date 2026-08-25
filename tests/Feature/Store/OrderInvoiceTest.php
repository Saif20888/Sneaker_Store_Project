<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;

test('the owning guest can download the invoice pdf', function () {
    $order = Order::factory()->create(['guest_id' => 'GST-INVOICEOWNER']);
    OrderItem::factory()->create(['order_id' => $order->id]);

    $response = $this->withCookie('guest_id', 'GST-INVOICEOWNER')->get(route('orders.invoice', $order));

    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');
});

test('the owning signed-in user can download the invoice pdf', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create(['user_id' => $user->id]);
    OrderItem::factory()->create(['order_id' => $order->id]);

    $response = $this->actingAs($user)->get(route('orders.invoice', $order));

    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');
});

test('someone who does not own the order cannot download its invoice', function () {
    $order = Order::factory()->create(['guest_id' => 'GST-REALINVOICE1']);

    $response = $this->get(route('orders.invoice', $order));

    $response->assertNotFound();
});
