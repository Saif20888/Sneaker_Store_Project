<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Http\Request;

class RequirePasswordIfSet
{
    public function __construct(private RequirePassword $requirePassword)
    {
        //
    }

    /**
     * Skip Laravel's password-confirmation gate for accounts that have no password
     * (Google OAuth-only accounts) — there is nothing for them to confirm, and
     * Hash::check() against a null hash always fails, which would otherwise lock
     * them out of this route permanently.
     *
     * @param  Closure(Request): mixed  $next
     */
    public function handle(Request $request, Closure $next): mixed
    {
        if (! $request->user()?->password) {
            return $next($request);
        }

        return $this->requirePassword->handle($request, $next);
    }
}
