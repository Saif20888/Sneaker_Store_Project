<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
    case Returned = 'returned';

    /**
     * Get the display label for the status.
     */
    public function label(): string
    {
        return ucfirst($this->value);
    }

    /**
     * Get the customer-facing tracking step label for this status.
     */
    public function trackingLabel(): string
    {
        return match ($this) {
            self::Pending => 'Order Placed',
            self::Processing => 'Packed',
            self::Shipped => 'Out for Delivery',
            self::Delivered => 'Delivered',
            self::Cancelled => 'Cancelled',
            self::Returned => 'Returned',
        };
    }

    /**
     * Determine whether this status frees up the order's reserved stock — i.e. the goods
     * are back in hand and available to sell again.
     */
    public function restocksInventory(): bool
    {
        return match ($this) {
            self::Cancelled, self::Returned => true,
            default => false,
        };
    }

    /**
     * Get the 1-indexed step this status represents on the tracking timeline.
     * Returns null for cancelled orders, which fall outside the linear timeline.
     */
    public function trackingStep(): ?int
    {
        return match ($this) {
            self::Pending => 1,
            self::Processing => 2,
            self::Shipped => 3,
            self::Delivered => 4,
            self::Cancelled, self::Returned => null,
        };
    }
}
