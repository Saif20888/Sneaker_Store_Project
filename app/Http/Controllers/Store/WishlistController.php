<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\ToggleWishlistRequest;
use App\Support\Wishlist;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    /**
     * Display the wishlist page.
     */
    public function index(): Response
    {
        return Inertia::render('wishlist', [
            'products' => Wishlist::items(),
        ]);
    }

    /**
     * Toggle a product in the wishlist.
     */
    public function toggle(ToggleWishlistRequest $request): RedirectResponse
    {
        Wishlist::toggle((int) $request->validated('product_id'));

        return back();
    }
}
