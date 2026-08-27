<?php

use App\Models\HomeBanner;
use App\Models\User;

test('guests cannot access admin banner routes', function () {
    $this->get(route('admin.banners.index'))->assertRedirect(route('login'));
});

test('non-admin users cannot access admin banner routes', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.banners.index'))->assertForbidden();
});

test('admin can set a click-through link on a banner', function () {
    $banner = HomeBanner::factory()->create(['link' => null]);

    $response = $this->actingAs(adminUser())
        ->patch(route('admin.banners.update', $banner), ['link' => '/shop']);

    $response->assertRedirect();
    expect($banner->fresh()->link)->toBe('/shop');
});

test('admin can clear a banner link', function () {
    $banner = HomeBanner::factory()->create(['link' => '/shop']);

    $this->actingAs(adminUser())
        ->patch(route('admin.banners.update', $banner), ['link' => null]);

    expect($banner->fresh()->link)->toBeNull();
});

test('admin sees the site\'s default banners already imported, ready to edit or delete', function () {
    // Seeded by the one-time seed_default_home_banners migration, so a fresh
    // install's admin isn't stuck editing an empty list.
    $response = $this->actingAs(adminUser())->get(route('admin.banners.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/banners/index')
        ->has('banners', 4)
        ->where('banners.0.image', '/images/banners/banner-1.webp'));
});
