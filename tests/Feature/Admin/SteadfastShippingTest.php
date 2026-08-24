<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Http;

test('guests cannot send an order to steadfast', function () {
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);

    $this->post(route('admin.orders.steadfast.send', $order))
        ->assertRedirect(route('login'));
});

test('non-admin users cannot send an order to steadfast', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);

    $this->actingAs($user)->post(route('admin.orders.steadfast.send', $order))
        ->assertForbidden();
});

test('admin can send an order to steadfast and the consignment details are stored', function () {
    Http::fake([
        '*/create_order' => Http::response([
            'status' => 200,
            'consignment' => [
                'consignment_id' => 12345,
                'tracking_code' => 'ABC123XYZ',
                'status' => 'in_review',
            ],
        ]),
    ]);

    $order = Order::factory()->create([
        'status' => OrderStatus::Processing,
        'customer_name' => 'Rahim Uddin',
        'phone_number' => '01712345678',
        'city' => 'Dhaka',
        'shipping_address' => '123 Test Street',
        'total_amount' => 3230,
    ]);

    $response = $this->actingAs(adminUser())->post(route('admin.orders.steadfast.send', $order));

    $response->assertRedirect();
    $response->assertSessionHas('status');

    $order->refresh();
    expect($order->steadfast_consignment_id)->toBe(12345);
    expect($order->steadfast_tracking_code)->toBe('ABC123XYZ');
    expect($order->steadfast_status)->toBe('in_review');

    $note = $order->notes()->latest()->first();
    expect($note->note)->toContain('ABC123XYZ');

    Http::assertSent(fn ($request) => $request['invoice'] === $order->order_number
        && $request['recipient_name'] === 'Rahim Uddin'
        && $request['cod_amount'] === 3230);
});

test('cancelled orders cannot be sent to steadfast', function () {
    $order = Order::factory()->create(['status' => OrderStatus::Cancelled]);

    $response = $this->actingAs(adminUser())->post(route('admin.orders.steadfast.send', $order));

    $response->assertSessionHasErrors('steadfast');
    expect($order->fresh()->steadfast_consignment_id)->toBeNull();
});

test('sending an order that was already sent to steadfast does not create a duplicate consignment', function () {
    Http::fake();

    $order = Order::factory()->create([
        'status' => OrderStatus::Processing,
        'steadfast_consignment_id' => 999,
        'steadfast_tracking_code' => 'ALREADY-SENT',
        'steadfast_status' => 'delivered',
    ]);

    $this->actingAs(adminUser())->post(route('admin.orders.steadfast.send', $order))
        ->assertRedirect();

    Http::assertNothingSent();
    expect($order->fresh()->steadfast_consignment_id)->toBe(999);
});

test('a failed steadfast api response surfaces an error and does not save partial data', function () {
    Http::fake([
        '*/create_order' => Http::response([
            'status' => 400,
            'message' => 'Invalid recipient phone number.',
        ]),
    ]);

    $order = Order::factory()->create(['status' => OrderStatus::Processing]);

    $response = $this->actingAs(adminUser())->post(route('admin.orders.steadfast.send', $order));

    $response->assertSessionHasErrors('steadfast');
    expect($order->fresh()->steadfast_consignment_id)->toBeNull();
});
