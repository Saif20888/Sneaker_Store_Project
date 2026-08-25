<?php

use App\Models\Review;

test('a visitor can submit a review, held pending approval', function () {
    $response = $this->post(route('reviews.store'), [
        'name' => 'Rafiul Islam',
        'city' => 'Dhaka',
        'rating' => 5,
        'comment' => 'Great service, fast delivery.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $review = Review::query()->where('name', 'Rafiul Islam')->firstOrFail();
    expect($review->is_approved)->toBeFalse();
    expect($review->rating)->toBe(5);
});

test('review submission requires a rating between 1 and 5', function () {
    $response = $this->post(route('reviews.store'), [
        'name' => 'Someone',
        'rating' => 6,
        'comment' => 'Test comment.',
    ]);

    $response->assertSessionHasErrors('rating');
});

test('the homepage only shows approved reviews', function () {
    Review::factory()->approved()->create(['name' => 'Approved Reviewer']);
    Review::factory()->create(['name' => 'Pending Reviewer']);

    $response = $this->get(route('home'));

    $response->assertInertia(fn ($page) => $page
        ->component('home')
        ->has('reviews', 1)
        ->where('reviews.0.name', 'Approved Reviewer'));
});
