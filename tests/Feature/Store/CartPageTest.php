<?php

use Inertia\Testing\AssertableInertia as Assert;

test('cart page renders', function () {
    $response = $this->get(route('cart.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page->component('cart'));
});
