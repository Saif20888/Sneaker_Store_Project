<?php

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

test('a new google login creates a new account and signs in', function () {
    Socialite::fake('google', SocialiteUser::fake([
        'id' => 'google-123',
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
    ]));

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('home'));

    $user = User::where('email', 'ada@example.com')->firstOrFail();
    expect($user->google_id)->toBe('google-123');
    expect($user->password)->toBeNull();
    expect($user->email_verified_at)->not->toBeNull();
    $this->assertAuthenticatedAs($user);
});

test('a google login with an email matching an existing password-protected account is refused, not linked', function () {
    // Regression test: without this, anyone could register victim@example.com with a
    // password (never proving they own the address), then the real owner clicking
    // "Continue with Google" would be silently logged into the attacker's account.
    $existing = User::factory()->create(['email' => 'ada@example.com', 'google_id' => null]);

    Socialite::fake('google', SocialiteUser::fake([
        'id' => 'google-123',
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
    ]));

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('login'));
    $response->assertSessionHas('error');
    expect($existing->fresh()->google_id)->toBeNull();
    $this->assertGuest();
});

test('a google login with an email matching an existing password-less account links it', function () {
    $existing = User::factory()->create(['email' => 'ada@example.com', 'google_id' => null, 'password' => null]);

    Socialite::fake('google', SocialiteUser::fake([
        'id' => 'google-123',
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
    ]));

    $this->get(route('auth.google.callback'));

    expect(User::where('email', 'ada@example.com')->count())->toBe(1);
    expect($existing->fresh()->google_id)->toBe('google-123');
    $this->assertAuthenticatedAs($existing->fresh());
});

test('a returning google user with a known google_id logs straight in', function () {
    $existing = User::factory()->create(['google_id' => 'google-123']);

    Socialite::fake('google', SocialiteUser::fake([
        'id' => 'google-123',
        'name' => $existing->name,
        'email' => $existing->email,
    ]));

    $this->get(route('auth.google.callback'));

    expect(User::count())->toBe(1);
    $this->assertAuthenticatedAs($existing);
});

test('a failed google callback redirects to login with an error', function () {
    Socialite::fake('google', function () {
        throw new Exception('denied');
    });

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('login'));
    $response->assertSessionHas('error');
    $this->assertGuest();
});
