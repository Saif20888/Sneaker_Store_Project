<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

trait PasswordValidationRules
{
    /**
     * Get the validation rules used to validate passwords.
     *
     * @return array<int, Password|ValidationRule|array<mixed>|string>
     */
    protected function passwordRules(): array
    {
        return ['required', 'string', Password::default(), 'confirmed'];
    }

    /**
     * Get the validation rules used to validate the current password.
     *
     * Skips the "current_password" check for accounts that have no password set
     * (Google OAuth-only accounts) — there's nothing for them to confirm, and
     * Hash::check() against a null hash always fails, which would otherwise make
     * this rule permanently unpassable for those accounts.
     *
     * @return array<int, Password|ValidationRule|array<mixed>|string>
     */
    protected function currentPasswordRules(): array
    {
        $user = $this instanceof FormRequest ? $this->user() : null;

        if ($user && ! $user->password) {
            return ['nullable'];
        }

        return ['required', 'string', 'current_password'];
    }
}
