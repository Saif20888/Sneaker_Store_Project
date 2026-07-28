<?php

namespace App\Http\Controllers\Store;

use App\Actions\Store\PlaceOrder;
use App\Enums\DeliveryZone;
use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Store\StoreOrderRequest;
use App\Services\SslCommerzService;
use App\Support\Cart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class CheckoutController extends Controller
{
    /**
     * Display the checkout page.
     */
    public function create(): Response
    {
        return Inertia::render('checkout', [
            'zones' => collect(DeliveryZone::cases())->map(fn (DeliveryZone $zone) => [
                'value' => $zone->value,
                'label' => $zone->label(),
                'fee' => $zone->fee(),
            ]),
            'paymentMethods' => collect(PaymentMethod::cases())->map(fn (PaymentMethod $method) => [
                'value' => $method->value,
                'label' => $method->label(),
            ]),
        ]);
    }

    /**
     * Place the order using the items currently in the session cart.
     */
    public function store(StoreOrderRequest $request, PlaceOrder $placeOrder, SslCommerzService $sslCommerz): RedirectResponse|SymfonyResponse
    {
        $items = collect(Cart::items())
            ->map(fn (int $quantity, int $variantId) => ['variant_id' => $variantId, 'quantity' => $quantity])
            ->values()
            ->all();

        $paymentMethod = PaymentMethod::from($request->validated('payment_method'));
        $isSslcommerz = $paymentMethod === PaymentMethod::Sslcommerz;

        $guestId = null;

        if (! $request->user()) {
            $guestId = $request->cookie('guest_id');

            if (! $guestId) {
                $guestId = 'GST-'.strtoupper(Str::random(10));
                Cookie::queue(Cookie::forever('guest_id', $guestId));
            }
        }

        $order = $placeOrder->handle(
            customerName: $request->validated('customer_name'),
            phoneNumber: $request->validated('phone_number'),
            city: $request->validated('city'),
            shippingAddress: $request->validated('shipping_address'),
            zone: DeliveryZone::from($request->validated('zone')),
            paymentMethod: $paymentMethod,
            paymentTransactionId: $isSslcommerz ? null : $request->validated('payment_transaction_id'),
            items: $items,
            userId: $request->user()?->id,
            guestId: $guestId,
            paymentStatus: $isSslcommerz ? 'pending' : null,
        );

        Cart::clear();

        if ($isSslcommerz) {
            return Inertia::location($sslCommerz->initiate($order));
        }

        return to_route('orders.success', ['order' => $order->order_number]);
    }
}
