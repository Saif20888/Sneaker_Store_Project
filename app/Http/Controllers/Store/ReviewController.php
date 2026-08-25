<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\StoreReviewRequest;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;

class ReviewController extends Controller
{
    /**
     * Submit a new site review. Held for admin approval before it appears publicly.
     */
    public function store(StoreReviewRequest $request): RedirectResponse
    {
        Review::query()->create([
            ...$request->validated(),
            'is_approved' => false,
        ]);

        return back()->with('status', "Thanks for your review! It'll appear on the site once approved.");
    }
}
