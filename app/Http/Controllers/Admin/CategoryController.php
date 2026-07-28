<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display the admin category list.
     */
    public function index(): Response
    {
        $categories = Category::query()
            ->withCount('products')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'slug' => $category->slug,
                'name' => $category->name,
                'image' => $category->image,
                'products_count' => $category->products_count,
            ]);

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Display the form for creating a new category.
     */
    public function create(): Response
    {
        return Inertia::render('admin/categories/create');
    }

    /**
     * Store a newly created category.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Category::query()->create([
            ...$request->safe()->only(['name', 'slug']),
            'image' => $this->storeUploadedImage($request->file('image')),
        ]);

        return to_route('admin.categories.index')->with('status', 'Category created.');
    }

    /**
     * Display the form for editing the given category.
     */
    public function edit(Category $category): Response
    {
        return Inertia::render('admin/categories/edit', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'image' => $category->image,
            ],
        ]);
    }

    /**
     * Update the given category.
     */
    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $image = $category->image;

        if ($request->hasFile('image') || $request->validated('remove_image')) {
            $this->deleteStoredImage($image);
            $image = $this->storeUploadedImage($request->file('image'));
        }

        $category->update([
            ...$request->safe()->only(['name', 'slug']),
            'image' => $image,
        ]);

        return to_route('admin.categories.index')->with('status', 'Category updated.');
    }

    /**
     * Delete the given category.
     */
    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            return back()->with('error', 'This category has products assigned to it and cannot be deleted.');
        }

        $this->deleteStoredImage($category->image);
        $category->delete();

        return to_route('admin.categories.index')->with('status', 'Category deleted.');
    }

    /**
     * Store the uploaded category image on the public disk and return its public URL.
     */
    private function storeUploadedImage(?UploadedFile $file): ?string
    {
        if (! $file) {
            return null;
        }

        return '/storage/'.$file->store('categories', 'public');
    }

    /**
     * Delete a previously stored category image from disk, if any.
     */
    private function deleteStoredImage(?string $image): void
    {
        if ($image) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $image));
        }
    }
}
