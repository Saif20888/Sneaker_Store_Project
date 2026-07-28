<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\AddToCartRequest;
use App\Http\Requests\Store\RemoveFromCartRequest;
use App\Support\Cart;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    /**
     * Display the standalone cart page.
     */
    public function index(): Response
    {
        return Inertia::render('cart');
    }

    /**
     * Add a variant to the cart.
     */
    public function store(AddToCartRequest $request): RedirectResponse
    {
        Cart::add((int) $request->validated('variant_id'), (int) $request->validated('quantity'));

        return back();
    }

    /**
     * Update the quantity of a variant already in the cart.
     */
    public function update(AddToCartRequest $request): RedirectResponse
    {
        Cart::update((int) $request->validated('variant_id'), (int) $request->validated('quantity'));

        return back();
    }

    /**
     * Remove a variant from the cart.
     */
    public function destroy(RemoveFromCartRequest $request): RedirectResponse
    {
        Cart::remove((int) $request->validated('variant_id'));

        return back();
    }
}
