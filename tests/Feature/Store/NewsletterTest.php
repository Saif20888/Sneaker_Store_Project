<?php

use App\Models\NewsletterSubscriber;

test('subscribing stores the email address', function () {
    $this->post(route('newsletter.store'), ['email' => 'shopper@example.com'])
        ->assertRedirect();

    $this->assertDatabaseHas('newsletter_subscribers', [
        'email' => 'shopper@example.com',
    ]);
});

test('subscribing twice with the same email does not create a duplicate', function () {
    NewsletterSubscriber::factory()->create(['email' => 'shopper@example.com']);

    $this->post(route('newsletter.store'), ['email' => 'shopper@example.com']);

    expect(NewsletterSubscriber::query()->where('email', 'shopper@example.com')->count())->toBe(1);
});

test('subscribing requires a valid email', function () {
    $response = $this->post(route('newsletter.store'), ['email' => 'not-an-email']);

    $response->assertSessionHasErrors('email');
});
