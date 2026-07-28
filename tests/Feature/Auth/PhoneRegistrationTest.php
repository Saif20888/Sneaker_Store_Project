<?php

use App\Models\User;

test('a user can register with a phone number only', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Phone User',
        'phone_number' => '01712345678',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('home'));

    $user = User::where('phone_number', '01712345678')->firstOrFail();
    expect($user->email)->toBeNull();
});

test('a user can register with an email only', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Email User',
        'email' => 'email-only@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('home'));

    $user = User::where('email', 'email-only@example.com')->firstOrFail();
    expect($user->phone_number)->toBeNull();
});

test('registration fails without either an email or a phone number', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'No Contact',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors(['email', 'phone_number']);
    $this->assertGuest();
});

test('registration rejects a phone number already in use', function () {
    User::factory()->create(['phone_number' => '01712345678', 'email' => null]);

    $response = $this->post(route('register.store'), [
        'name' => 'Duplicate Phone',
        'phone_number' => '01712345678',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors('phone_number');
});
