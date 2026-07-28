<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;

test('guests cannot record delivery cost', function () {
    $order = Order::factory()->create(['status' => OrderStatus::Delivered]);

    $this->patch(route('admin.orders.update-delivery-cost', $order), [])
        ->assertRedirect(route('login'));
});

test('non-admin users cannot record delivery cost', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create(['status' => OrderStatus::Delivered]);

    $this->actingAs($user)->patch(route('admin.orders.update-delivery-cost', $order), [
        'actual_delivery_cost' => 90,
    ])->assertForbidden();
});

test('admin can record the actual courier cost and see the delivery profit', function () {
    $order = Order::factory()->create([
        'status' => OrderStatus::Delivered,
        'delivery_fee' => 150,
    ]);

    $admin = adminUser();

    $response = $this->actingAs($admin)->patch(route('admin.orders.update-delivery-cost', $order), [
        'actual_delivery_cost' => 90,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('status');

    $order->refresh();
    expect($order->actual_delivery_cost)->toBe(90);
    expect($order->deliveryProfit())->toBe(60);

    $note = $order->notes()->latest()->first();
    expect($note->note)->toContain('Courier cost recorded');
    expect($note->note)->toContain('profit');
});

test('recording a courier cost higher than the delivery fee logs a loss', function () {
    $order = Order::factory()->create([
        'status' => OrderStatus::Shipped,
        'delivery_fee' => 80,
    ]);

    $this->actingAs(adminUser())->patch(route('admin.orders.update-delivery-cost', $order), [
        'actual_delivery_cost' => 130,
    ]);

    $order->refresh();
    expect($order->deliveryProfit())->toBe(-50);

    $note = $order->notes()->latest()->first();
    expect($note->note)->toContain('loss');
});

test('delivery cost cannot be recorded before the order has shipped', function () {
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);

    $response = $this->actingAs(adminUser())->patch(route('admin.orders.update-delivery-cost', $order), [
        'actual_delivery_cost' => 90,
    ]);

    $response->assertSessionHasErrors('actual_delivery_cost');
    expect($order->fresh()->actual_delivery_cost)->toBeNull();
});

test('actual delivery cost is required and must be a non-negative integer', function () {
    $order = Order::factory()->create(['status' => OrderStatus::Delivered]);

    $this->actingAs(adminUser())->patch(route('admin.orders.update-delivery-cost', $order), [
        'actual_delivery_cost' => -10,
    ])->assertSessionHasErrors('actual_delivery_cost');
});
