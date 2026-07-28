<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access admin product routes', function () {
    $response = $this->get(route('admin.products.index'));

    $response->assertRedirect(route('login'));
});

test('non-admin users cannot access admin product routes', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('admin.products.index'));

    $response->assertForbidden();
});

test('admin can view the product index', function () {
    Product::factory()->count(3)->create();

    $response = $this->actingAs(adminUser())->get(route('admin.products.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/products/index')
        ->has('products.data', 3));
});

test('admin can search and filter the product index', function () {
    $nike = Brand::factory()->create(['name' => 'Nike']);
    $adidas = Brand::factory()->create(['name' => 'Adidas']);
    $sneakers = Category::factory()->create(['name' => 'Sneakers']);
    $boots = Category::factory()->create(['name' => 'Boots']);

    Product::factory()->create(['name' => 'Air Max 90', 'brand_id' => $nike->id, 'category_id' => $sneakers->id]);
    Product::factory()->create(['name' => 'Air Force 1', 'brand_id' => $nike->id, 'category_id' => $sneakers->id]);
    Product::factory()->create(['name' => 'Stan Smith', 'brand_id' => $adidas->id, 'category_id' => $boots->id]);

    $admin = adminUser();

    $this->actingAs($admin)->get(route('admin.products.index', ['q' => 'Air']))
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 2));

    $this->actingAs($admin)->get(route('admin.products.index', ['brand' => $adidas->id]))
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 1));

    $this->actingAs($admin)->get(route('admin.products.index', ['category' => $boots->id]))
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 1));

    $this->actingAs($admin)->get(route('admin.products.index', ['q' => 'Air', 'brand' => $nike->id]))
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 2));

    $this->actingAs($admin)->get(route('admin.products.index', ['q' => 'Nothing Matches']))
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 0));
});

test('admin can create a product with variants and images', function () {
    Storage::fake('public');

    $category = Category::factory()->create();
    $brand = Brand::factory()->create();

    $response = $this->actingAs(adminUser())->post(route('admin.products.store'), [
        'name' => 'Air Test 1',
        'slug' => 'air-test-1',
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'description' => 'A test sneaker.',
        'original_price' => 5000,
        'discount_price' => 4000,
        'discount_percentage' => 20,
        'is_featured' => true,
        'is_trending' => false,
        'images' => [UploadedFile::fake()->image('shoe.jpg')],
        'variants' => [
            ['size' => '42', 'stock_quantity' => 10],
            ['size' => '43', 'stock_quantity' => 5],
        ],
    ]);

    $response->assertRedirect(route('admin.products.index'));

    $product = Product::where('slug', 'air-test-1')->firstOrFail();

    expect($product->name)->toBe('Air Test 1');
    expect($product->variants)->toHaveCount(2);
    expect($product->images)->toHaveCount(1);

    Storage::disk('public')->assertExists(
        str_replace('/storage/', '', $product->images[0]),
    );
});

test('admin can upload multiple images where the first is the main image', function () {
    Storage::fake('public');

    $category = Category::factory()->create();
    $brand = Brand::factory()->create();

    $this->actingAs(adminUser())->post(route('admin.products.store'), [
        'name' => 'Air Test Gallery',
        'slug' => 'air-test-gallery',
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'original_price' => 5000,
        'images' => [
            UploadedFile::fake()->image('main.jpg'),
            UploadedFile::fake()->image('second.jpg'),
            UploadedFile::fake()->image('third.jpg'),
        ],
        'variants' => [['size' => '42', 'stock_quantity' => 10]],
    ]);

    $product = Product::where('slug', 'air-test-gallery')->firstOrFail();

    expect($product->images)->toHaveCount(3);

    foreach ($product->images as $image) {
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $image));
    }
});

test('admin can promote an existing image to main when updating a product', function () {
    Storage::fake('public');

    $product = Product::factory()->create([
        'images' => ['/storage/products/first.jpg', '/storage/products/second.jpg'],
    ]);
    $variant = ProductVariant::factory()->create(['product_id' => $product->id]);

    $this->actingAs(adminUser())->patch(route('admin.products.update', $product), [
        'name' => $product->name,
        'slug' => $product->slug,
        'category_id' => $product->category_id,
        'brand_id' => $product->brand_id,
        'original_price' => $product->original_price,
        'existing_images' => ['/storage/products/first.jpg', '/storage/products/second.jpg'],
        'image_order' => ['existing', 'existing'],
        'variants' => [['id' => $variant->id, 'size' => $variant->size, 'stock_quantity' => $variant->stock_quantity]],
    ]);

    expect($product->fresh()->images)->toBe(['/storage/products/first.jpg', '/storage/products/second.jpg']);

    $this->actingAs(adminUser())->patch(route('admin.products.update', $product), [
        'name' => $product->name,
        'slug' => $product->slug,
        'category_id' => $product->category_id,
        'brand_id' => $product->brand_id,
        'original_price' => $product->original_price,
        'existing_images' => ['/storage/products/second.jpg', '/storage/products/first.jpg'],
        'image_order' => ['existing', 'existing'],
        'variants' => [['id' => $variant->id, 'size' => $variant->size, 'stock_quantity' => $variant->stock_quantity]],
    ]);

    expect($product->fresh()->images)->toBe(['/storage/products/second.jpg', '/storage/products/first.jpg']);
});

test('removing a product image on update deletes the file from disk', function () {
    Storage::fake('public');
    Storage::disk('public')->put('products/keep.jpg', 'fake-contents');
    Storage::disk('public')->put('products/drop.jpg', 'fake-contents');

    $product = Product::factory()->create([
        'images' => ['/storage/products/keep.jpg', '/storage/products/drop.jpg'],
    ]);
    $variant = ProductVariant::factory()->create(['product_id' => $product->id]);

    $this->actingAs(adminUser())->patch(route('admin.products.update', $product), [
        'name' => $product->name,
        'slug' => $product->slug,
        'category_id' => $product->category_id,
        'brand_id' => $product->brand_id,
        'original_price' => $product->original_price,
        'existing_images' => ['/storage/products/keep.jpg'],
        'image_order' => ['existing'],
        'variants' => [['id' => $variant->id, 'size' => $variant->size, 'stock_quantity' => $variant->stock_quantity]],
    ]);

    expect($product->fresh()->images)->toBe(['/storage/products/keep.jpg']);
    Storage::disk('public')->assertExists('products/keep.jpg');
    Storage::disk('public')->assertMissing('products/drop.jpg');
});

test('deleting a product deletes its images from disk', function () {
    Storage::fake('public');
    Storage::disk('public')->put('products/gone.jpg', 'fake-contents');

    $product = Product::factory()->create(['images' => ['/storage/products/gone.jpg']]);

    $this->actingAs(adminUser())->delete(route('admin.products.destroy', $product));

    Storage::disk('public')->assertMissing('products/gone.jpg');
});

test('creating a product requires at least one variant', function () {
    $category = Category::factory()->create();
    $brand = Brand::factory()->create();

    $response = $this->actingAs(adminUser())->post(route('admin.products.store'), [
        'name' => 'No Variant Shoe',
        'slug' => 'no-variant-shoe',
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'original_price' => 5000,
        'variants' => [],
    ]);

    $response->assertSessionHasErrors('variants');
});

test('admin can update a product and its variants', function () {
    $product = Product::factory()->create(['name' => 'Old Name']);
    $variant = ProductVariant::factory()->create([
        'product_id' => $product->id,
        'size' => '42',
        'stock_quantity' => 5,
    ]);

    $response = $this->actingAs(adminUser())->patch(route('admin.products.update', $product), [
        'name' => 'New Name',
        'slug' => $product->slug,
        'category_id' => $product->category_id,
        'brand_id' => $product->brand_id,
        'original_price' => $product->original_price,
        'existing_images' => [],
        'variants' => [
            ['id' => $variant->id, 'size' => '42', 'stock_quantity' => 20],
            ['size' => '44', 'stock_quantity' => 8],
        ],
    ]);

    $response->assertRedirect(route('admin.products.index'));

    expect($product->fresh()->name)->toBe('New Name');
    expect($variant->fresh()->stock_quantity)->toBe(20);
    expect($product->fresh()->variants)->toHaveCount(2);
});

test('admin can delete a product with no orders', function () {
    $product = Product::factory()->create();
    ProductVariant::factory()->create(['product_id' => $product->id]);

    $response = $this->actingAs(adminUser())->delete(route('admin.products.destroy', $product));

    $response->assertRedirect(route('admin.products.index'));
    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

test('admin cannot delete a product that has existing orders', function () {
    $product = Product::factory()->create();
    $variant = ProductVariant::factory()->create(['product_id' => $product->id]);
    OrderItem::factory()->create(['product_variant_id' => $variant->id]);

    $response = $this->actingAs(adminUser())->delete(route('admin.products.destroy', $product));

    $response->assertRedirect();
    $response->assertSessionHas('error');
    $this->assertDatabaseHas('products', ['id' => $product->id]);
});
