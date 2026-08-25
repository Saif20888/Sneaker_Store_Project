<?php

use App\Models\Review;
use App\Models\User;

test('guests cannot access admin review routes', function () {
    $this->get(route('admin.reviews.index'))->assertRedirect(route('login'));
});

test('non-admin users cannot access admin review routes', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.reviews.index'))->assertForbidden();
});

test('admin can view submitted reviews, pending first', function () {
    Review::factory()->approved()->create(['name' => 'Already Approved']);
    Review::factory()->create(['name' => 'Waiting For Approval']);

    $response = $this->actingAs(adminUser())->get(route('admin.reviews.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/reviews/index')
        ->has('reviews', 2)
        ->where('reviews.0.name', 'Waiting For Approval'));
});

test('admin can approve a pending review', function () {
    $review = Review::factory()->create(['is_approved' => false]);

    $response = $this->actingAs(adminUser())
        ->patch(route('admin.reviews.approve', $review));

    $response->assertRedirect();
    expect($review->fresh()->is_approved)->toBeTrue();
});

test('admin can delete a review', function () {
    $review = Review::factory()->create();

    $response = $this->actingAs(adminUser())
        ->delete(route('admin.reviews.destroy', $review));

    $response->assertRedirect();
    $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
});
