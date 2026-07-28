<?php

use App\Models\Product;
use App\Models\User;

test('guests are redirected to login when visiting the wishlist page', function () {
    $response = $this->get(route('wishlist.index'));

    $response->assertRedirect(route('login'));
});

test('guests are redirected to login when toggling the wishlist', function () {
    $product = Product::factory()->create();

    $response = $this->post(route('wishlist.toggle'), ['product_id' => $product->id]);

    $response->assertRedirect(route('login'));
});

test('wishlist page renders with an empty wishlist by default', function () {
    $this->actingAs(User::factory()->create());

    $response = $this->get(route('wishlist.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('wishlist')
        ->where('products', []));
});

test('toggling a product adds it to the wishlist', function () {
    $this->actingAs(User::factory()->create());
    $product = Product::factory()->create();

    $this->post(route('wishlist.toggle'), ['product_id' => $product->id])
        ->assertRedirect();

    $response = $this->get(route('wishlist.index'));

    $response->assertInertia(fn ($page) => $page
        ->has('products', 1)
        ->where('products.0.slug', $product->slug));
});

test('toggling an already-wishlisted product removes it', function () {
    $this->actingAs(User::factory()->create());
    $product = Product::factory()->create();

    $this->post(route('wishlist.toggle'), ['product_id' => $product->id]);
    $this->post(route('wishlist.toggle'), ['product_id' => $product->id]);

    $response = $this->get(route('wishlist.index'));

    $response->assertInertia(fn ($page) => $page->where('products', []));
});

test('toggling requires a valid product', function () {
    $this->actingAs(User::factory()->create());

    $response = $this->post(route('wishlist.toggle'), ['product_id' => 999999]);

    $response->assertSessionHasErrors('product_id');
});

test('wishlist state is shared across pages', function () {
    $this->actingAs(User::factory()->create());
    $product = Product::factory()->create();

    $this->post(route('wishlist.toggle'), ['product_id' => $product->id]);

    $response = $this->get(route('home'));

    $response->assertInertia(fn ($page) => $page
        ->where('wishlist.ids', [$product->id])
        ->where('wishlist.count', 1));
});

test('each user only sees their own wishlist', function () {
    $product = Product::factory()->create();
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();

    $this->actingAs($owner)->post(route('wishlist.toggle'), ['product_id' => $product->id]);

    $response = $this->actingAs($otherUser)->get(route('wishlist.index'));

    $response->assertInertia(fn ($page) => $page->where('products', []));
});
