<?php

use App\Models\HomeBanner;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access admin banner routes', function () {
    $this->get(route('admin.banners.index'))->assertRedirect(route('login'));
});

test('non-admin users cannot access admin banner routes', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.banners.index'))->assertForbidden();
});

test('admin can view the banner list', function () {
    // Clear the default banners the seed-default-banners migration inserts, so this
    // test's count assertion is deterministic regardless of that one-time data migration.
    HomeBanner::query()->delete();
    HomeBanner::factory()->count(2)->create();

    $response = $this->actingAs(adminUser())->get(route('admin.banners.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/banners/index')
        ->has('banners', 2));
});

test('admin can upload multiple banners at once, appended to the end of the order', function () {
    Storage::fake('public');

    HomeBanner::query()->delete();
    HomeBanner::factory()->create(['position' => 0]);

    $response = $this->actingAs(adminUser())->post(route('admin.banners.store'), [
        'images' => [
            UploadedFile::fake()->image('banner-a.jpg'),
            UploadedFile::fake()->image('banner-b.jpg'),
        ],
    ]);

    $response->assertRedirect(route('admin.banners.index'));
    expect(HomeBanner::count())->toBe(3);
    expect(HomeBanner::orderBy('position')->pluck('position')->all())->toBe([0, 1, 2]);
});

test('uploading a banner requires at least one image', function () {
    HomeBanner::query()->delete();

    $response = $this->actingAs(adminUser())->post(route('admin.banners.store'), [
        'images' => [],
    ]);

    $response->assertSessionHasErrors('images');
    expect(HomeBanner::count())->toBe(0);
});

test('admin can reorder banners', function () {
    HomeBanner::query()->delete();
    $first = HomeBanner::factory()->create(['position' => 0]);
    $second = HomeBanner::factory()->create(['position' => 1]);

    $response = $this->actingAs(adminUser())->patch(route('admin.banners.reorder'), [
        'order' => [$second->id, $first->id],
    ]);

    $response->assertRedirect();
    expect($second->fresh()->position)->toBe(0);
    expect($first->fresh()->position)->toBe(1);
});

test('reordering rejects a submission that omits an existing banner', function () {
    HomeBanner::query()->delete();
    $first = HomeBanner::factory()->create(['position' => 0]);
    $second = HomeBanner::factory()->create(['position' => 1]);
    HomeBanner::factory()->create(['position' => 2]);

    $response = $this->actingAs(adminUser())->patch(route('admin.banners.reorder'), [
        'order' => [$second->id, $first->id],
    ]);

    $response->assertStatus(422);
    expect($first->fresh()->position)->toBe(0);
    expect($second->fresh()->position)->toBe(1);
});

test('admin can delete a banner', function () {
    Storage::fake('public');

    $banner = HomeBanner::factory()->create(['image' => '/storage/banners/test.jpg']);

    $response = $this->actingAs(adminUser())->delete(route('admin.banners.destroy', $banner));

    $response->assertRedirect(route('admin.banners.index'));
    $this->assertDatabaseMissing('home_banners', ['id' => $banner->id]);
});
