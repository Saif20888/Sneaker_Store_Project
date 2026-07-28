<?php

namespace App\Models;

use App\Enums\ExchangeCondition;
use Database\Factories\ExchangeRecordFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $order_id
 * @property int $order_item_id
 * @property int $returned_variant_id
 * @property int $new_variant_id
 * @property ExchangeCondition $condition
 * @property int $price_difference
 * @property int $shipping_charge
 * @property int $balance_amount
 * @property string|null $notes
 * @property int|null $user_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Order $order
 * @property-read OrderItem $orderItem
 * @property-read ProductVariant $returnedVariant
 * @property-read ProductVariant $newVariant
 * @property-read User|null $user
 */
#[Fillable(['order_id', 'order_item_id', 'returned_variant_id', 'new_variant_id', 'condition', 'price_difference', 'shipping_charge', 'balance_amount', 'notes', 'user_id'])]
class ExchangeRecord extends Model
{
    /** @use HasFactory<ExchangeRecordFactory> */
    use HasFactory;

    /**
     * The table associated with the model (class is ExchangeRecord to avoid ambiguity
     * with "currency exchange", but the table follows the plain "exchanges" name).
     */
    protected $table = 'exchanges';

    /**
     * Get the order this exchange belongs to.
     *
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the original order line item that was exchanged.
     *
     * @return BelongsTo<OrderItem, $this>
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    /**
     * Get the variant that was returned.
     *
     * @return BelongsTo<ProductVariant, $this>
     */
    public function returnedVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'returned_variant_id');
    }

    /**
     * Get the variant that was sent out in exchange.
     *
     * @return BelongsTo<ProductVariant, $this>
     */
    public function newVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'new_variant_id');
    }

    /**
     * Get the admin who processed this exchange, if any.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'condition' => ExchangeCondition::class,
        ];
    }
}
