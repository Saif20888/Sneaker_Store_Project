<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;

test('guests cannot process exchanges', function () {
    $order = Order::factory()->create(['status' => OrderStatus::Delivered]);

    $this->post(route('admin.orders.exchanges.store', $order), [])
        ->assertRedirect(route('login'));
});

test('non-admin users cannot process exchanges', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create(['status' => OrderStatus::Delivered]);

    $this->actingAs($user)->post(route('admin.orders.exchanges.store', $order), [])
        ->assertForbidden();
});

test('admin can process a restocked exchange with no price difference', function () {
    $product = Product::factory()->create(['original_price' => 5000, 'discount_price' => null]);
    $oldVariant = ProductVariant::factory()->create(['product_id' => $product->id, 'size' => '41', 'stock_quantity' => 3]);
    $newVariant = ProductVariant::factory()->create(['product_id' => $product->id, 'size' => '42', 'stock_quantity' => 5]);

    $order = Order::factory()->create([
        'status' => OrderStatus::Delivered,
        'subtotal' => 5000,
        'delivery_fee' => 80,
        'total_amount' => 5080,
    ]);
    $item = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_variant_id' => $oldVariant->id,
        'product_name' => $product->name,
        'size' => '41',
        'unit_price' => 5000,
        'quantity' => 1,
    ]);

    $admin = adminUser();

    $response = $this->actingAs($admin)->post(route('admin.orders.exchanges.store', $order), [
        'order_item_id' => $item->id,
        'new_variant_id' => $newVariant->id,
        'condition' => 'restocked',
        'shipping_charge' => 100,
        'notes' => 'Customer wanted a bigger size',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('status');

    expect($oldVariant->fresh()->stock_quantity)->toBe(4);
    expect($newVariant->fresh()->stock_quantity)->toBe(4);

    $item->refresh();
    expect($item->product_variant_id)->toBe($newVariant->id);
    expect($item->size)->toBe('42');
    expect($item->unit_price)->toBe(5000);

    $order->refresh();
    expect($order->subtotal)->toBe(5000);
    expect($order->total_amount)->toBe(5080);

    $exchange = $order->exchanges()->first();
    expect($exchange)->not->toBeNull();
    expect($exchange->returned_variant_id)->toBe($oldVariant->id);
    expect($exchange->new_variant_id)->toBe($newVariant->id);
    expect($exchange->condition->value)->toBe('restocked');
    expect($exchange->price_difference)->toBe(0);
    expect($exchange->shipping_charge)->toBe(100);
    expect($exchange->balance_amount)->toBe(100);
    expect($exchange->user_id)->toBe($admin->id);

    $note = $order->notes()->latest()->first();
    expect($note->note)->toContain('Exchanged');
    expect($note->note)->toContain('Restocked');
});

test('exchanging to a pricier product charges the balance for the price difference', function () {
    $productA = Product::factory()->create(['original_price' => 5000, 'discount_price' => null]);
    $variantA = ProductVariant::factory()->create(['product_id' => $productA->id, 'size' => '41', 'stock_quantity' => 3]);

    $productB = Product::factory()->create(['original_price' => 7000, 'discount_price' => null]);
    $variantB = ProductVariant::factory()->create(['product_id' => $productB->id, 'size' => '42', 'stock_quantity' => 5]);

    $order = Order::factory()->create([
        'status' => OrderStatus::Delivered,
        'subtotal' => 10000,
        'delivery_fee' => 80,
        'total_amount' => 10080,
    ]);
    $item = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_variant_id' => $variantA->id,
        'product_name' => $productA->name,
        'size' => '41',
        'unit_price' => 5000,
        'quantity' => 2,
    ]);

    $this->actingAs(adminUser())->post(route('admin.orders.exchanges.store', $order), [
        'order_item_id' => $item->id,
        'new_variant_id' => $variantB->id,
        'condition' => 'restocked',
        'shipping_charge' => 0,
    ]);

    $exchange = $order->exchanges()->first();
    expect($exchange->price_difference)->toBe(4000);
    expect($exchange->balance_amount)->toBe(4000);

    $order->refresh();
    expect($order->subtotal)->toBe(14000);
    expect($order->total_amount)->toBe(14080);
});

test('a damaged exchange does not restock the returned variant', function () {
    $product = Product::factory()->create();
    $oldVariant = ProductVariant::factory()->create(['product_id' => $product->id, 'stock_quantity' => 3]);
    $newVariant = ProductVariant::factory()->create(['product_id' => $product->id, 'stock_quantity' => 5]);

    $order = Order::factory()->create(['status' => OrderStatus::Delivered]);
    $item = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_variant_id' => $oldVariant->id,
        'product_name' => $product->name,
        'unit_price' => $product->currentPrice(),
        'quantity' => 1,
    ]);

    $this->actingAs(adminUser())->post(route('admin.orders.exchanges.store', $order), [
        'order_item_id' => $item->id,
        'new_variant_id' => $newVariant->id,
        'condition' => 'damaged',
    ]);

    expect($oldVariant->fresh()->stock_quantity)->toBe(3);
    expect($newVariant->fresh()->stock_quantity)->toBe(4);
    expect($order->exchanges()->first()->condition->value)->toBe('damaged');
});

test('exchanges are blocked on orders that have not shipped yet', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);
    $newVariant = ProductVariant::factory()->create(['stock_quantity' => 5]);
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);
    $item = OrderItem::factory()->create(['order_id' => $order->id, 'product_variant_id' => $variant->id]);

    $response = $this->actingAs(adminUser())->post(route('admin.orders.exchanges.store', $order), [
        'order_item_id' => $item->id,
        'new_variant_id' => $newVariant->id,
        'condition' => 'restocked',
    ]);

    $response->assertSessionHasErrors('order_item_id');
    expect($order->exchanges()->count())->toBe(0);
});

test('exchanges are blocked on cancelled orders', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);
    $newVariant = ProductVariant::factory()->create(['stock_quantity' => 5]);
    $order = Order::factory()->create(['status' => OrderStatus::Cancelled]);
    $item = OrderItem::factory()->create(['order_id' => $order->id, 'product_variant_id' => $variant->id]);

    $response = $this->actingAs(adminUser())->post(route('admin.orders.exchanges.store', $order), [
        'order_item_id' => $item->id,
        'new_variant_id' => $newVariant->id,
        'condition' => 'restocked',
    ]);

    $response->assertSessionHasErrors('order_item_id');
});

test('exchange fails when the new size has insufficient stock, without leaving a partial restock', function () {
    $product = Product::factory()->create();
    $oldVariant = ProductVariant::factory()->create(['product_id' => $product->id, 'stock_quantity' => 3]);
    $newVariant = ProductVariant::factory()->create(['product_id' => $product->id, 'stock_quantity' => 0]);

    $order = Order::factory()->create(['status' => OrderStatus::Delivered]);
    $item = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_variant_id' => $oldVariant->id,
        'quantity' => 1,
    ]);

    $response = $this->actingAs(adminUser())->post(route('admin.orders.exchanges.store', $order), [
        'order_item_id' => $item->id,
        'new_variant_id' => $newVariant->id,
        'condition' => 'restocked',
    ]);

    $response->assertSessionHasErrors('new_variant_id');
    expect($oldVariant->fresh()->stock_quantity)->toBe(3);
    expect($order->exchanges()->count())->toBe(0);
});

test('exchange fails when the item does not belong to the order', function () {
    $order = Order::factory()->create(['status' => OrderStatus::Delivered]);
    $otherOrder = Order::factory()->create(['status' => OrderStatus::Delivered]);
    $item = OrderItem::factory()->create(['order_id' => $otherOrder->id]);
    $newVariant = ProductVariant::factory()->create(['stock_quantity' => 5]);

    $response = $this->actingAs(adminUser())->post(route('admin.orders.exchanges.store', $order), [
        'order_item_id' => $item->id,
        'new_variant_id' => $newVariant->id,
        'condition' => 'restocked',
    ]);

    $response->assertSessionHasErrors('order_item_id');
});
