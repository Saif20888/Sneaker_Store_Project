<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\CheckoutController;
use App\Http\Controllers\Store\ContactController;
use App\Http\Controllers\Store\DropsController;
use App\Http\Controllers\Store\HomeController;
use App\Http\Controllers\Store\NewsletterController;
use App\Http\Controllers\Store\OrderController;
use App\Http\Controllers\Store\PageController;
use App\Http\Controllers\Store\ProductController;
use App\Http\Controllers\Store\SslCommerzController;
use App\Http\Controllers\Store\StoreLocationController;
use App\Http\Controllers\Store\TrackOrderController;
use App\Http\Controllers\Store\WishlistController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('shop', [ProductController::class, 'index'])->name('products.index');
Route::get('sneakers/{product:slug}', [ProductController::class, 'show'])->name('products.show');
Route::get('quick-view/{product:slug}', [ProductController::class, 'quickView'])->name('products.quick-view');

Route::get('new-arrivals', [DropsController::class, 'index'])->name('drops.index');

Route::get('stores', [StoreLocationController::class, 'index'])->name('stores.index');

Route::get('track-order', [TrackOrderController::class, 'index'])->name('track-order.index');

Route::get('auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
Route::get('auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

Route::get('cart', [CartController::class, 'index'])->name('cart.index');
Route::get('checkout', [CheckoutController::class, 'create'])->name('checkout.index');

Route::middleware('throttle:storefront-write')->group(function () {
    Route::post('cart/add', [CartController::class, 'store'])->name('cart.store');
    Route::patch('cart/update', [CartController::class, 'update'])->name('cart.update');
    Route::delete('cart/remove', [CartController::class, 'destroy'])->name('cart.destroy');
    Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');
});

Route::middleware(['auth'])->group(function () {
    Route::get('wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('wishlist/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
});

Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
Route::get('orders/success/{order:order_number}', [OrderController::class, 'show'])->name('orders.success');
Route::get('orders/{order:order_number}/invoice', [OrderController::class, 'invoice'])->name('orders.invoice');

Route::match(['get', 'post'], 'payments/sslcommerz/success', [SslCommerzController::class, 'success'])->name('payments.sslcommerz.success');
Route::match(['get', 'post'], 'payments/sslcommerz/fail', [SslCommerzController::class, 'fail'])->name('payments.sslcommerz.fail');
Route::match(['get', 'post'], 'payments/sslcommerz/cancel', [SslCommerzController::class, 'cancel'])->name('payments.sslcommerz.cancel');
Route::post('payments/sslcommerz/ipn', [SslCommerzController::class, 'ipn'])->name('payments.sslcommerz.ipn');

Route::post('newsletter/subscribe', [NewsletterController::class, 'store'])->name('newsletter.store');

Route::get('about-us', [PageController::class, 'about'])->name('pages.about');
Route::get('contact-us', [ContactController::class, 'index'])->name('pages.contact');
Route::get('refund-policy', [PageController::class, 'refundPolicy'])->name('pages.refund-policy');
Route::get('return-policy', [PageController::class, 'returnPolicy'])->name('pages.return-policy');
Route::get('cancellation-policy', [PageController::class, 'cancellationPolicy'])->name('pages.cancellation-policy');
Route::get('terms-conditions', [PageController::class, 'terms'])->name('pages.terms');
Route::get('privacy-policy', [PageController::class, 'privacy'])->name('pages.privacy');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class, EnsureUserIsAdmin::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
