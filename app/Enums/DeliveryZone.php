<?php

namespace App\Enums;

enum DeliveryZone: string
{
    case InsideDhaka = 'inside_dhaka';
    case OutsideDhaka = 'outside_dhaka';

    /**
     * Get the display label for the zone.
     */
    public function label(): string
    {
        return match ($this) {
            self::InsideDhaka => 'Inside Dhaka',
            self::OutsideDhaka => 'Outside Dhaka',
        };
    }

    /**
     * Get the flat delivery fee (in BDT) for this zone.
     */
    public function fee(): int
    {
        return match ($this) {
            self::InsideDhaka => 80,
            self::OutsideDhaka => 150,
        };
    }

    /**
     * Get the human-readable estimated delivery timeline for this zone.
     */
    public function estimatedDelivery(): string
    {
        return match ($this) {
            self::InsideDhaka => '1-2 days',
            self::OutsideDhaka => '3-4 days',
        };
    }
}
