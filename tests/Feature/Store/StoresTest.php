<?php

use Inertia\Testing\AssertableInertia as Assert;

test('stores page renders the store locations', function () {
    $response = $this->get(route('stores.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('stores')
        ->has('locations', 1));
});
