<?php

namespace App\Models;

use App\Enums\DeliveryZone;
use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string|null $guest_id
 * @property string $order_number
 * @property OrderSource $source
 * @property string $customer_name
 * @property string $phone_number
 * @property string $city
 * @property string $shipping_address
 * @property DeliveryZone $zone
 * @property int $delivery_fee
 * @property int|null $actual_delivery_cost
 * @property int|null $steadfast_consignment_id
 * @property string|null $steadfast_tracking_code
 * @property string|null $steadfast_status
 * @property int $subtotal
 * @property int $total_amount
 * @property PaymentMethod $payment_method
 * @property string|null $payment_transaction_id
 * @property string|null $payment_status
 * @property OrderStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, OrderItem> $items
 * @property-read Collection<int, OrderNote> $notes
 * @property-read Collection<int, ExchangeRecord> $exchanges
 * @property-read User|null $user
 */
#[Fillable(['user_id', 'guest_id', 'source', 'customer_name', 'phone_number', 'city', 'shipping_address', 'zone', 'delivery_fee', 'actual_delivery_cost', 'subtotal', 'total_amount', 'payment_method', 'payment_transaction_id', 'payment_status', 'status'])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    /**
     * Bootstrap the model and its traits.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Order $order) {
            if (empty($order->order_number)) {
                $order->order_number = 'VNT-'.strtoupper(Str::random(8));
            }
        });
    }

    /**
     * Get the line items for this order.
     *
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the audit-trail notes for this order.
     *
     * @return HasMany<OrderNote, $this>
     */
    public function notes(): HasMany
    {
        return $this->hasMany(OrderNote::class);
    }

    /**
     * Get the post-delivery size exchanges processed for this order.
     *
     * @return HasMany<ExchangeRecord, $this>
     */
    public function exchanges(): HasMany
    {
        return $this->hasMany(ExchangeRecord::class);
    }

    /**
     * Get the account this order was placed under, if the customer was signed in at checkout.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the profit (or loss, if negative) on this order's delivery leg — the customer-charged
     * delivery fee minus the actual courier cost. Returns null until the courier cost is recorded.
     */
    public function deliveryProfit(): ?int
    {
        return $this->actual_delivery_cost === null ? null : $this->delivery_fee - $this->actual_delivery_cost;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'zone' => DeliveryZone::class,
            'source' => OrderSource::class,
            'payment_method' => PaymentMethod::class,
            'status' => OrderStatus::class,
        ];
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'order_number';
    }
}
