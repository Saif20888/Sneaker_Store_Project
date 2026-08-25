<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreHomeBannerRequest;
use App\Http\Requests\Admin\UpdateHomeBannerRequest;
use App\Models\HomeBanner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class HomeBannerController extends Controller
{
    /**
     * Display the admin homepage banner list.
     */
    public function index(): Response
    {
        return Inertia::render('admin/banners/index', [
            'banners' => HomeBanner::query()
                ->orderBy('position')
                ->get()
                ->map(fn (HomeBanner $banner) => [
                    'id' => $banner->id,
                    'image' => $banner->image,
                    'link' => $banner->link,
                ]),
        ]);
    }

    /**
     * Upload one or more new homepage banners, appended to the end of the order.
     */
    public function store(StoreHomeBannerRequest $request): RedirectResponse
    {
        $nextPosition = ((int) HomeBanner::query()->max('position')) + 1;

        collect($request->file('images'))
            ->each(function (UploadedFile $file, int $index) use (&$nextPosition) {
                HomeBanner::query()->create([
                    'image' => '/storage/'.$file->store('banners', 'public'),
                    'position' => $nextPosition + $index,
                ]);
            });

        return to_route('admin.banners.index')->with('status', 'Banner(s) added.');
    }

    /**
     * Persist the admin's chosen display order for the homepage banners.
     *
     * Requires the full current set of banner ids (not a subset) — reindexing only
     * some banners to 0..n-1 would collide with the untouched ones' existing
     * positions and scramble the homepage order.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = Validator::make($request->all(), [
            'order' => ['required', 'array', 'min:1'],
            'order.*' => ['integer', 'distinct', 'exists:home_banners,id'],
        ])->validate();

        $currentIds = HomeBanner::query()->pluck('id')->sort()->values()->all();
        $submittedIds = collect($validated['order'])->sort()->values()->all();

        abort_unless($currentIds === $submittedIds, 422);

        foreach ($validated['order'] as $index => $id) {
            HomeBanner::query()->whereKey($id)->update(['position' => $index]);
        }

        return back()->with('status', 'Banner order updated.');
    }

    /**
     * Set (or clear) the click-through link for the given homepage banner.
     */
    public function update(UpdateHomeBannerRequest $request, HomeBanner $banner): RedirectResponse
    {
        $banner->update($request->validated());

        return back()->with('status', 'Banner link updated.');
    }

    /**
     * Delete the given homepage banner.
     */
    public function destroy(HomeBanner $banner): RedirectResponse
    {
        Storage::disk('public')->delete(str_replace('/storage/', '', $banner->image));

        $banner->delete();

        return to_route('admin.banners.index')->with('status', 'Banner deleted.');
    }
}
