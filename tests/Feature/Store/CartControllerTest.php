<?php

use App\Models\ProductVariant;

test('cart page renders with the current cart shared as a prop', function () {
    $response = $this->get(route('cart.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('cart')
        ->has('cart', fn ($cart) => $cart
            ->where('items', [])
            ->where('count', 0)
            ->where('subtotal', 0)));
});

test('adding a variant to the cart is reflected in the shared cart prop', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);
    $product = $variant->product;

    $this->post(route('cart.store'), ['variant_id' => $variant->id, 'quantity' => 2])
        ->assertRedirect();

    $response = $this->get(route('cart.index'));

    $response->assertInertia(fn ($page) => $page
        ->has('cart.items', 1)
        ->where('cart.items.0.variant_id', $variant->id)
        ->where('cart.items.0.quantity', 2)
        ->where('cart.count', 2)
        ->where('cart.subtotal', $product->currentPrice() * 2));
});

test('adding to the cart clamps quantity to available stock and a max of 5', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 3]);

    $this->post(route('cart.store'), ['variant_id' => $variant->id, 'quantity' => 5]);

    $response = $this->get(route('cart.index'));

    $response->assertInertia(fn ($page) => $page->where('cart.items.0.quantity', 3));
});

test('updating cart quantity changes the stored quantity', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);

    $this->post(route('cart.store'), ['variant_id' => $variant->id, 'quantity' => 1]);
    $this->patch(route('cart.update'), ['variant_id' => $variant->id, 'quantity' => 3]);

    $response = $this->get(route('cart.index'));

    $response->assertInertia(fn ($page) => $page->where('cart.items.0.quantity', 3));
});

test('removing a variant clears it from the cart', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);

    $this->post(route('cart.store'), ['variant_id' => $variant->id, 'quantity' => 1]);
    $this->delete(route('cart.destroy'), ['variant_id' => $variant->id]);

    $response = $this->get(route('cart.index'));

    $response->assertInertia(fn ($page) => $page
        ->where('cart.items', [])
        ->where('cart.count', 0));
});

test('adding to cart requires a valid variant', function () {
    $response = $this->post(route('cart.store'), ['variant_id' => 999999, 'quantity' => 1]);

    $response->assertSessionHasErrors('variant_id');
});

test('adding an out-of-stock variant to the cart fails instead of silently adding zero', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 0]);

    $response = $this->post(route('cart.store'), ['variant_id' => $variant->id, 'quantity' => 1]);

    $response->assertSessionHasErrors('variant_id');

    $cart = $this->get(route('cart.index'));
    $cart->assertInertia(fn ($page) => $page->where('cart.items', []));
});

test('viewing the cart prunes a variant that was deleted after being added', function () {
    $variant = ProductVariant::factory()->create(['stock_quantity' => 5]);

    $this->post(route('cart.store'), ['variant_id' => $variant->id, 'quantity' => 1]);
    $variant->delete();

    $response = $this->get(route('cart.index'));

    $response->assertInertia(fn ($page) => $page
        ->where('cart.items', [])
        ->where('cart.count', 0));

    // The stale entry must actually be removed from the underlying session cart
    // (not just filtered from this one response), or checkout stays permanently
    // broken — it builds order items straight from the raw session cart.
    expect(session('cart'))->toBe([]);
});
