<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SteadfastService
{
    /**
     * Create a courier consignment for the given order and return the
     * consignment ID, tracking code, and status SteadFast assigned it.
     *
     * @return array{consignment_id: int, tracking_code: string, status: string}
     */
    public function createOrder(Order $order): array
    {
        $response = $this->client()->post('/create_order', [
            'invoice' => $order->order_number,
            'recipient_name' => $order->customer_name,
            'recipient_phone' => $order->phone_number,
            'recipient_address' => "{$order->shipping_address}, {$order->city}",
            'cod_amount' => $order->total_amount,
            'note' => "Vint-Edge order {$order->order_number}",
        ])->json();

        if (($response['status'] ?? null) !== 200 || empty($response['consignment'])) {
            throw new RuntimeException($response['message'] ?? 'Unable to create SteadFast consignment.');
        }

        $consignment = $response['consignment'];

        return [
            'consignment_id' => $consignment['consignment_id'],
            'tracking_code' => $consignment['tracking_code'],
            'status' => $consignment['status'],
        ];
    }

    /**
     * Look up the current delivery status of a consignment by its SteadFast consignment ID.
     */
    public function statusByConsignmentId(int $consignmentId): ?string
    {
        $response = $this->client()->get("/status_by_cid/{$consignmentId}")->json();

        return $response['delivery_status'] ?? null;
    }

    /**
     * Get the current SteadFast account balance (in BDT).
     */
    public function getBalance(): float
    {
        $response = $this->client()->get('/get_balance')->json();

        if (($response['status'] ?? null) !== 200) {
            throw new RuntimeException($response['message'] ?? 'Unable to fetch SteadFast balance.');
        }

        return (float) $response['current_balance'];
    }

    /**
     * Build an HTTP client pre-configured with SteadFast's required auth headers.
     */
    private function client(): PendingRequest
    {
        return Http::baseUrl(config('services.steadfast.base_url'))
            ->withHeaders([
                'Api-Key' => config('services.steadfast.api_key'),
                'Secret-Key' => config('services.steadfast.secret_key'),
            ])
            ->acceptJson();
    }
}
