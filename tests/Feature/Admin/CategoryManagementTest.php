<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access admin category routes', function () {
    $response = $this->get(route('admin.categories.index'));

    $response->assertRedirect(route('login'));
});

test('non-admin users cannot access admin category routes', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('admin.categories.index'));

    $response->assertForbidden();
});

test('admin can view the category index with product counts', function () {
    $category = Category::factory()->create(['name' => 'Running']);
    Product::factory()->count(2)->create(['category_id' => $category->id]);
    Category::factory()->create(['name' => 'Basketball']);

    $response = $this->actingAs(adminUser())->get(route('admin.categories.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/categories/index')
        ->has('categories', 2)
        ->where('categories.0.name', 'Basketball')
        ->where('categories.1.products_count', 2));
});

test('admin can create a category', function () {
    $response = $this->actingAs(adminUser())->post(route('admin.categories.store'), [
        'name' => 'Trail Running',
        'slug' => 'trail-running',
    ]);

    $response->assertRedirect(route('admin.categories.index'));
    $this->assertDatabaseHas('categories', ['slug' => 'trail-running', 'name' => 'Trail Running']);
});

test('admin can create a category with an image', function () {
    Storage::fake('public');

    $response = $this->actingAs(adminUser())->post(route('admin.categories.store'), [
        'name' => 'Trail Running',
        'slug' => 'trail-running',
        'image' => UploadedFile::fake()->image('category.jpg'),
    ]);

    $response->assertRedirect(route('admin.categories.index'));

    $category = Category::where('slug', 'trail-running')->firstOrFail();
    expect($category->image)->not->toBeNull();
    Storage::disk('public')->assertExists(str_replace('/storage/', '', $category->image));
});

test('admin can replace a category image on update', function () {
    Storage::fake('public');

    $category = Category::factory()->create(['image' => '/storage/categories/old.jpg']);

    $response = $this->actingAs(adminUser())->patch(route('admin.categories.update', $category), [
        'name' => $category->name,
        'slug' => $category->slug,
        'image' => UploadedFile::fake()->image('new.jpg'),
    ]);

    $response->assertRedirect(route('admin.categories.index'));
    expect($category->fresh()->image)->not->toBe('/storage/categories/old.jpg');
});

test('admin can remove a category image on update', function () {
    Storage::fake('public');

    $category = Category::factory()->create(['image' => '/storage/categories/old.jpg']);
    Storage::disk('public')->put('categories/old.jpg', 'fake-contents');

    $response = $this->actingAs(adminUser())->patch(route('admin.categories.update', $category), [
        'name' => $category->name,
        'slug' => $category->slug,
        'remove_image' => true,
    ]);

    $response->assertRedirect(route('admin.categories.index'));
    expect($category->fresh()->image)->toBeNull();
    Storage::disk('public')->assertMissing('categories/old.jpg');
});

test('creating a category requires a unique slug', function () {
    Category::factory()->create(['slug' => 'lifestyle']);

    $response = $this->actingAs(adminUser())->post(route('admin.categories.store'), [
        'name' => 'Lifestyle Again',
        'slug' => 'lifestyle',
    ]);

    $response->assertSessionHasErrors('slug');
});

test('admin can update a category', function () {
    $category = Category::factory()->create(['name' => 'Old Name', 'slug' => 'old-name']);

    $response = $this->actingAs(adminUser())->patch(route('admin.categories.update', $category), [
        'name' => 'New Name',
        'slug' => 'old-name',
    ]);

    $response->assertRedirect(route('admin.categories.index'));
    expect($category->fresh()->name)->toBe('New Name');
});

test('admin can delete a category with no products', function () {
    $category = Category::factory()->create();

    $response = $this->actingAs(adminUser())->delete(route('admin.categories.destroy', $category));

    $response->assertRedirect(route('admin.categories.index'));
    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

test('admin cannot delete a category that has products', function () {
    $category = Category::factory()->create();
    Product::factory()->create(['category_id' => $category->id]);

    $response = $this->actingAs(adminUser())->delete(route('admin.categories.destroy', $category));

    $response->assertRedirect();
    $response->assertSessionHas('error');
    $this->assertDatabaseHas('categories', ['id' => $category->id]);
});
