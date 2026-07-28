<?php

namespace App\Enums;

enum ExchangeCondition: string
{
    case Restocked = 'restocked';
    case Damaged = 'damaged';

    /**
     * Get the display label for the returned item's condition.
     */
    public function label(): string
    {
        return match ($this) {
            self::Restocked => 'Restocked',
            self::Damaged => 'Damaged',
        };
    }
}
