<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Import the banner images currently hardcoded as the homepage carousel's fallback
     * into the home_banners table, so admins can manage (edit/delete) them like any
     * other banner. Skips entirely if banners already exist — this is a one-time import,
     * not something that should ever overwrite an admin's existing banner set.
     */
    public function up(): void
    {
        if (DB::table('home_banners')->count() > 0) {
            return;
        }

        $defaults = [
            '/images/banners/banner-1.webp',
            '/images/banners/banner-4.webp',
            '/images/banners/banner-2.webp',
            '/images/banners/banner-3.webp',
        ];

        foreach ($defaults as $position => $image) {
            DB::table('home_banners')->insert([
                'image' => $image,
                'link' => null,
                'position' => $position,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op: this only ever inserts starter rows once, and an admin may have already
        // edited or added to them by the time this migration would be rolled back.
    }
};
