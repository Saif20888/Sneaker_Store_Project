<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SslCommerzService
{
    /**
     * Start an SSLCommerz payment session for the given order and return the
     * gateway page URL the customer should be redirected to.
     */
    public function initiate(Order $order): string
    {
        $response = Http::asForm()->post($this->baseUrl().'/gwprocess/v4/api.php', [
            'store_id' => config('services.sslcommerz.store_id'),
            'store_passwd' => config('services.sslcommerz.store_password'),
            'total_amount' => $order->total_amount,
            'currency' => 'BDT',
            'tran_id' => $order->order_number,
            'success_url' => route('payments.sslcommerz.success'),
            'fail_url' => route('payments.sslcommerz.fail'),
            'cancel_url' => route('payments.sslcommerz.cancel'),
            'ipn_url' => route('payments.sslcommerz.ipn'),
            'cus_name' => $order->customer_name,
            'cus_email' => $order->user?->email ?? "{$order->order_number}@vint-edge.test",
            'cus_phone' => $order->phone_number,
            'cus_add1' => $order->shipping_address,
            'cus_city' => $order->city,
            'cus_country' => 'Bangladesh',
            'shipping_method' => 'NO',
            'product_name' => 'Sneakers',
            'product_category' => 'Fashion',
            'product_profile' => 'general',
        ])->json();

        if (($response['status'] ?? null) !== 'SUCCESS' || empty($response['GatewayPageURL'])) {
            throw new RuntimeException($response['failedreason'] ?? 'Unable to initiate SSLCommerz payment.');
        }

        return $response['GatewayPageURL'];
    }

    /**
     * Validate a completed transaction against SSLCommerz to confirm it's genuine.
     *
     * @return array<string, mixed>|null
     */
    public function validateTransaction(string $valId): ?array
    {
        $response = Http::get($this->baseUrl().'/validator/api/validationserverAPI.php', [
            'val_id' => $valId,
            'store_id' => config('services.sslcommerz.store_id'),
            'store_passwd' => config('services.sslcommerz.store_password'),
            'format' => 'json',
        ])->json();

        if (! in_array($response['status'] ?? null, ['VALID', 'VALIDATED'], true)) {
            return null;
        }

        return $response;
    }

    /**
     * Get the SSLCommerz API base URL for the configured environment.
     */
    private function baseUrl(): string
    {
        return config('services.sslcommerz.sandbox')
            ? 'https://sandbox.sslcommerz.com'
            : 'https://securepay.sslcommerz.com';
    }
}
