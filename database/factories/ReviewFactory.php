<?php

namespace Database\Factories;

use App\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'city' => fake()->randomElement(['Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 'Rajshahi']),
            'rating' => fake()->numberBetween(3, 5),
            'comment' => fake()->paragraph(),
            'is_approved' => false,
        ];
    }

    /**
     * Indicate that the review has been approved by an admin.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => ['is_approved' => true]);
    }
}
