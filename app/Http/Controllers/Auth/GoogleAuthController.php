<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    /**
     * Redirect the user to Google's OAuth consent screen.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google's OAuth callback: find, link, or create the account, then log in.
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable) {
            return to_route('login')->with('error', 'Google sign-in was cancelled or failed. Please try again.');
        }

        $user = $this->resolveUser($googleUser);

        if (! $user) {
            return to_route('login')->with('error', 'An account already exists with this email. Please log in with your password instead.');
        }

        Auth::login($user, remember: true);

        return redirect()->intended(route('home'));
    }

    /**
     * Find the user this Google account belongs to, linking or creating as needed.
     *
     * Only auto-links onto an existing account when that account has no password —
     * i.e. it's already Google-only. An existing password-protected account is never
     * silently linked: anyone could have registered that email/password combination
     * without proving they own the address, so linking on email match alone would let
     * a Google login for that address take over an account it doesn't actually belong
     * to. Returns null to signal "refuse — an account already exists" for the caller
     * to handle.
     */
    private function resolveUser(SocialiteUser $googleUser): ?User
    {
        $user = User::query()->where('google_id', $googleUser->getId())->first();

        if ($user) {
            return $user;
        }

        $existing = User::query()->where('email', $googleUser->getEmail())->first();

        if ($existing) {
            if ($existing->password) {
                return null;
            }

            $existing->forceFill(['google_id' => $googleUser->getId()])->save();

            return $existing;
        }

        return User::query()->create([
            'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'Google User',
            'email' => $googleUser->getEmail(),
            'google_id' => $googleUser->getId(),
            'email_verified_at' => now(),
            'password' => null,
        ]);
    }
}
