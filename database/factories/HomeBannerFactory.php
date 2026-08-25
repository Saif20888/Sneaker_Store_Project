<?php

namespace Database\Factories;

use App\Models\HomeBanner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HomeBanner>
 */
class HomeBannerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'image' => '/storage/banners/'.$this->faker->uuid().'.jpg',
            'link' => null,
            'position' => 0,
        ];
    }
}
