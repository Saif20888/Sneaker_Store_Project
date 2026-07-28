<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ExchangeController;
use App\Http\Controllers\Admin\HomeBannerController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'verified', EnsureUserIsAdmin::class])
    ->group(function () {
        Route::get('products', [ProductController::class, 'index'])->name('products.index');
        Route::get('products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
        Route::get('products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::patch('products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/create', [OrderController::class, 'create'])->name('orders.create');
        Route::post('orders', [OrderController::class, 'storeManual'])->name('orders.store');
        Route::get('orders/{order:order_number}', [OrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order:order_number}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');
        Route::patch('orders/{order:order_number}/items', [OrderController::class, 'updateItems'])->name('orders.update-items');
        Route::patch('orders/{order:order_number}/delivery-cost', [OrderController::class, 'updateDeliveryCost'])->name('orders.update-delivery-cost');
        Route::post('orders/{order:order_number}/notes', [OrderController::class, 'storeNote'])->name('orders.notes.store');
        Route::post('orders/{order:order_number}/exchanges', [ExchangeController::class, 'store'])->name('orders.exchanges.store');

        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');

        Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::get('categories/create', [CategoryController::class, 'create'])->name('categories.create');
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::get('categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
        Route::patch('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::get('banners', [HomeBannerController::class, 'index'])->name('banners.index');
        Route::post('banners', [HomeBannerController::class, 'store'])->name('banners.store');
        Route::patch('banners/reorder', [HomeBannerController::class, 'reorder'])->name('banners.reorder');
        Route::delete('banners/{banner}', [HomeBannerController::class, 'destroy'])->name('banners.destroy');
    });
