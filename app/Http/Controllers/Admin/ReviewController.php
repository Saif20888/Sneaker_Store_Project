<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    /**
     * Display submitted reviews, pending ones first, for admin moderation.
     */
    public function index(): Response
    {
        return Inertia::render('admin/reviews/index', [
            'reviews' => Review::query()
                ->orderBy('is_approved')
                ->latest()
                ->get()
                ->map(fn (Review $review) => [
                    'id' => $review->id,
                    'name' => $review->name,
                    'city' => $review->city,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'is_approved' => $review->is_approved,
                    'created_at' => $review->created_at->toDayDateTimeString(),
                ]),
        ]);
    }

    /**
     * Approve the given review so it shows on the homepage.
     */
    public function approve(Review $review): RedirectResponse
    {
        $review->update(['is_approved' => true]);

        return back()->with('status', 'Review approved.');
    }

    /**
     * Delete the given review, whether pending or already approved.
     */
    public function destroy(Review $review): RedirectResponse
    {
        $review->delete();

        return back()->with('status', 'Review deleted.');
    }
}
