<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\SubscribeNewsletterRequest;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;

class NewsletterController extends Controller
{
    /**
     * Subscribe an email address to the newsletter.
     */
    public function store(SubscribeNewsletterRequest $request): RedirectResponse
    {
        NewsletterSubscriber::query()->firstOrCreate([
            'email' => $request->validated('email'),
        ]);

        return back()->with('status', 'subscribed');
    }
}
