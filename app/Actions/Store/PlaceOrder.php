<?php

namespace App\Actions\Store;

use App\Enums\DeliveryZone;
use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PlaceOrder
{
    /**
     * Place a new COD/mobile-banking order for the given cart items.
     *
     * @param  array<int, array{variant_id: int, quantity: int}>  $items
     */
    public function handle(
        string $customerName,
        string $phoneNumber,
        string $city,
        string $shippingAddress,
        DeliveryZone $zone,
        PaymentMethod $paymentMethod,
        ?string $paymentTransactionId,
        array $items,
        ?int $userId = null,
        ?string $guestId = null,
        ?string $paymentStatus = null,
        OrderSource $source = OrderSource::Website,
    ): Order {
        if (empty($items)) {
            throw ValidationException::withMessages(['items' => 'Your bag is empty.']);
        }

        return DB::transaction(function () use ($customerName, $phoneNumber, $city, $shippingAddress, $zone, $paymentMethod, $paymentTransactionId, $items, $userId, $guestId, $paymentStatus, $source) {
            $variantIds = array_column($items, 'variant_id');

            $variants = ProductVariant::query()
                ->with('product')
                ->whereIn('id', $variantIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $lineItems = [];

            foreach ($items as $item) {
                /** @var ProductVariant|null $variant */
                $variant = $variants->get($item['variant_id']);

                if (! $variant) {
                    throw ValidationException::withMessages(['items' => 'One of the items in your cart is no longer available.']);
                }

                if ($variant->stock_quantity < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => "{$variant->product->name} (EU {$variant->size}) only has {$variant->stock_quantity} pair(s) left.",
                    ]);
                }

                $unitPrice = $variant->product->currentPrice();
                $subtotal += $unitPrice * $item['quantity'];

                $lineItems[] = [
                    'variant' => $variant,
                    'product_name' => $variant->product->name,
                    'size' => $variant->size,
                    'unit_price' => $unitPrice,
                    'quantity' => $item['quantity'],
                ];
            }

            $deliveryFee = $zone->fee();

            $order = Order::create([
                'user_id' => $userId,
                'guest_id' => $guestId,
                'source' => $source,
                'customer_name' => $customerName,
                'phone_number' => $phoneNumber,
                'city' => $city,
                'shipping_address' => $shippingAddress,
                'zone' => $zone,
                'delivery_fee' => $deliveryFee,
                'subtotal' => $subtotal,
                'total_amount' => $subtotal + $deliveryFee,
                'payment_method' => $paymentMethod,
                'payment_transaction_id' => $paymentTransactionId,
                'payment_status' => $paymentStatus,
                'status' => OrderStatus::Pending,
            ]);

            foreach ($lineItems as $lineItem) {
                $order->items()->create([
                    'product_variant_id' => $lineItem['variant']->id,
                    'product_name' => $lineItem['product_name'],
                    'size' => $lineItem['size'],
                    'unit_price' => $lineItem['unit_price'],
                    'quantity' => $lineItem['quantity'],
                ]);

                $lineItem['variant']->decrement('stock_quantity', $lineItem['quantity']);
            }

            return $order;
        });
    }
}
