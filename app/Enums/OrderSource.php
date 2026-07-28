<?php

namespace App\Enums;

enum OrderSource: string
{
    case Website = 'website';
    case Messenger = 'messenger';
    case Whatsapp = 'whatsapp';
    case Phone = 'phone';
    case Other = 'other';

    /**
     * Get the display label for the order source.
     */
    public function label(): string
    {
        return match ($this) {
            self::Website => 'Website',
            self::Messenger => 'Messenger',
            self::Whatsapp => 'WhatsApp',
            self::Phone => 'Phone Call',
            self::Other => 'Other',
        };
    }
}
