<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access admin order routes', function () {
    $order = Order::factory()->create();

    $this->get(route('admin.orders.index'))->assertRedirect(route('login'));
    $this->get(route('admin.orders.show', $order))->assertRedirect(route('login'));
});

test('non-admin users cannot access admin order routes', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create();

    $this->actingAs($user)->get(route('admin.orders.index'))->assertForbidden();
    $this->actingAs($user)->patch(route('admin.orders.update-status', $order), ['status' => 'processing'])->assertForbidden();
});

test('admin can view the order index with status tabs', function () {
    Order::factory()->count(2)->create(['status' => OrderStatus::Pending]);
    Order::factory()->create(['status' => OrderStatus::Delivered]);

    $response = $this->actingAs(adminUser())->get(route('admin.orders.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/orders/index')
        ->has('orders.data', 3)
        ->where('statusFilter', 'all'));
});

test('admin can filter orders by status', function () {
    Order::factory()->count(2)->create(['status' => OrderStatus::Pending]);
    Order::factory()->create(['status' => OrderStatus::Delivered]);

    $response = $this->actingAs(adminUser())->get(route('admin.orders.index', ['status' => 'pending']));

    $response->assertInertia(fn ($page) => $page
        ->component('admin/orders/index')
        ->has('orders.data', 2));
});

test('admin can search orders by order number', function () {
    $order = Order::factory()->create(['order_number' => 'VNT-FINDME1']);
    Order::factory()->create();

    $response = $this->actingAs(adminUser())->get(route('admin.orders.index', ['q' => 'FINDME1']));

    $response->assertInertia(fn ($page) => $page
        ->has('orders.data', 1)
        ->where('orders.data.0.order_number', $order->order_number));
});

test('admin order index and show expose the customer id fields', function () {
    $user = User::factory()->create();
    $accountOrder = Order::factory()->create(['user_id' => $user->id, 'guest_id' => null]);
    $guestOrder = Order::factory()->create(['user_id' => null, 'guest_id' => 'GST-ABCDEFGHIJ']);

    $admin = adminUser();

    $this->actingAs($admin)->get(route('admin.orders.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 2)
            ->has('orders.data.0.user_id')
            ->has('orders.data.0.guest_id'));

    $this->actingAs($admin)->get(route('admin.orders.show', $accountOrder))
        ->assertInertia(fn (Assert $page) => $page
            ->where('order.user_id', $user->id)
            ->where('order.guest_id', null));

    $this->actingAs($admin)->get(route('admin.orders.show', $guestOrder))
        ->assertInertia(fn (Assert $page) => $page
            ->where('order.user_id', null)
            ->where('order.guest_id', 'GST-ABCDEFGHIJ'));
});

test('two concurrent cancel calls on the same order do not double-restock', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 3]);
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_variant_id' => $variant->id,
        'quantity' => 2,
    ]);

    // Two independently-loaded, equally-stale copies of the same order, simulating
    // two concurrent requests (e.g. SSLCommerz fail + cancel callbacks racing).
    $staleA = Order::find($order->id);
    $staleB = Order::find($order->id);

    app(App\Actions\Admin\UpdateOrderStatus::class)->handle($staleA, OrderStatus::Cancelled);
    app(App\Actions\Admin\UpdateOrderStatus::class)->handle($staleB, OrderStatus::Cancelled);

    expect($variant->fresh()->stock_quantity)->toBe(5);
});

test('cancelling an order restocks its variants', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 3]);
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_variant_id' => $variant->id,
        'quantity' => 2,
    ]);

    $response = $this->actingAs(adminUser())
        ->patch(route('admin.orders.update-status', $order), ['status' => 'cancelled']);

    $response->assertRedirect();
    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled);
    expect($variant->fresh()->stock_quantity)->toBe(5);
});

test('reopening a cancelled order re-decrements stock when available', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);
    $order = Order::factory()->create(['status' => OrderStatus::Cancelled]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_variant_id' => $variant->id,
        'quantity' => 2,
    ]);

    $response = $this->actingAs(adminUser())
        ->patch(route('admin.orders.update-status', $order), ['status' => 'processing']);

    $response->assertRedirect();
    expect($order->fresh()->status)->toBe(OrderStatus::Processing);
    expect($variant->fresh()->stock_quantity)->toBe(3);
});

test('reopening a cancelled order fails when stock is no longer available', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 1]);
    $order = Order::factory()->create(['status' => OrderStatus::Cancelled]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_variant_id' => $variant->id,
        'quantity' => 2,
    ]);

    $response = $this->actingAs(adminUser())
        ->patch(route('admin.orders.update-status', $order), ['status' => 'processing']);

    $response->assertSessionHasErrors('status');
    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled);
    expect($variant->fresh()->stock_quantity)->toBe(1);
});

test('admin can change an order item to a different product variant and totals recompute', function () {
    $productA = Product::factory()->create(['original_price' => 10000, 'discount_price' => null]);
    $variantA = ProductVariant::factory()->create(['product_id' => $productA->id, 'size' => '42', 'stock_quantity' => 5]);

    $productB = Product::factory()->create(['original_price' => 7000, 'discount_price' => null]);
    $variantB = ProductVariant::factory()->create(['product_id' => $productB->id, 'size' => '43', 'stock_quantity' => 5]);

    $order = Order::factory()->create(['status' => OrderStatus::Pending, 'delivery_fee' => 80]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_variant_id' => $variantA->id,
        'quantity' => 2,
    ]);

    $response = $this->actingAs(adminUser())->patch(route('admin.orders.update-items', $order), [
        'items' => [
            ['product_variant_id' => $variantB->id, 'quantity' => 3],
        ],
    ]);

    $response->assertRedirect();

    $order->refresh();
    expect($variantA->fresh()->stock_quantity)->toBe(7);
    expect($variantB->fresh()->stock_quantity)->toBe(2);
    expect($order->items)->toHaveCount(1);
    expect($order->items->first()->product_variant_id)->toBe($variantB->id);
    expect($order->subtotal)->toBe(21000);
    expect($order->total_amount)->toBe(21080);

    $note = $order->notes()->latest()->first();
    expect($note)->not->toBeNull();
    expect($note->note)->toStartWith('Order items updated. Now:');
    expect($note->note)->toContain($productB->name);
});

test('changing an order item to a different size on the same product logs a size-update note', function () {
    $product = Product::factory()->create();
    $variant41 = ProductVariant::factory()->create(['product_id' => $product->id, 'size' => '41', 'stock_quantity' => 5]);
    $variant42 = ProductVariant::factory()->create(['product_id' => $product->id, 'size' => '42', 'stock_quantity' => 5]);

    $order = Order::factory()->create(['status' => OrderStatus::Pending]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_variant_id' => $variant41->id,
        'product_name' => $product->name,
        'size' => '41',
        'quantity' => 1,
    ]);

    $admin = adminUser();

    $this->actingAs($admin)->patch(route('admin.orders.update-items', $order), [
        'items' => [
            ['product_variant_id' => $variant42->id, 'quantity' => 1],
        ],
    ]);

    $note = $order->notes()->latest()->first();
    expect($note->note)->toBe("Size updated from 41 to 42 for {$product->name}.");
    expect($note->user_id)->toBe($admin->id);
});

test('editing items is blocked once an order has shipped', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);
    $order = Order::factory()->create(['status' => OrderStatus::Shipped]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_variant_id' => $variant->id,
        'quantity' => 1,
    ]);

    $response = $this->actingAs(adminUser())->patch(route('admin.orders.update-items', $order), [
        'items' => [
            ['product_variant_id' => $variant->id, 'quantity' => 2],
        ],
    ]);

    $response->assertSessionHasErrors('items');
    expect($order->items()->count())->toBe(1);
    expect($order->items()->first()->quantity)->toBe(1);
});
