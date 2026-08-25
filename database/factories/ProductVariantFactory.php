<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            // unique() avoids the (product_id, size) collisions that occur when a test
            // creates several variants for the same product without pinning sizes itself.
            'size' => fake()->unique()->randomElement(['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']),
            'stock_quantity' => fake()->numberBetween(0, 20),
        ];
    }

    /**
     * Indicate that the variant is out of stock.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => ['stock_quantity' => 0]);
    }
}
