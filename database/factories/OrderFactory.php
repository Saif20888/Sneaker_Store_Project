<?php

namespace Database\Factories;

use App\Enums\DeliveryZone;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $zone = fake()->randomElement(DeliveryZone::cases());
        $subtotal = fake()->numberBetween(4500, 22000);

        return [
            'customer_name' => fake()->name(),
            'phone_number' => '01'.fake()->numerify('#########'),
            'city' => fake()->randomElement(['Dhaka', 'Chittagong', 'Sylhet']),
            'shipping_address' => fake()->address(),
            'zone' => $zone,
            'delivery_fee' => $zone->fee(),
            'subtotal' => $subtotal,
            'total_amount' => $subtotal + $zone->fee(),
            'payment_method' => PaymentMethod::CashOnDelivery,
            'status' => OrderStatus::Pending,
        ];
    }
}
