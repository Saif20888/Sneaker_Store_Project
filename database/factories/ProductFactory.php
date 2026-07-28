<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->word().' '.fake()->word().' '.fake()->word();
        $originalPrice = fake()->numberBetween(4500, 22000);

        return [
            'category_id' => Category::factory(),
            'brand_id' => Brand::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(),
            'original_price' => $originalPrice,
            'discount_price' => null,
            'discount_percentage' => null,
            'images' => [],
            'is_featured' => false,
            'is_trending' => false,
            'release_date' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }

    /**
     * Indicate that the product is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => ['is_featured' => true]);
    }

    /**
     * Indicate that the product is trending.
     */
    public function trending(): static
    {
        return $this->state(fn (array $attributes) => ['is_trending' => true]);
    }

    /**
     * Indicate that the product is discounted by the given percentage.
     */
    public function discounted(int $percentage = 30): static
    {
        return $this->state(function (array $attributes) use ($percentage) {
            $original = $attributes['original_price'] ?? fake()->numberBetween(4500, 22000);

            return [
                'original_price' => $original,
                'discount_price' => (int) round($original * (1 - $percentage / 100)),
                'discount_percentage' => $percentage,
            ];
        });
    }
}
