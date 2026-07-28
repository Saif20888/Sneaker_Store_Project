<?php

namespace App\Http\Controllers\Store;

use App\Actions\Admin\UpdateOrderStatus;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\SslCommerzService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SslCommerzController extends Controller
{
    public function __construct(private SslCommerzService $sslCommerz)
    {
        //
    }

    /**
     * Handle SSLCommerz's redirect back after a successful payment.
     */
    public function success(Request $request): RedirectResponse
    {
        $order = Order::where('order_number', $request->input('tran_id'))->firstOrFail();

        $validated = $this->sslCommerz->validateTransaction($request->input('val_id', ''));

        if (! $validated || ! $this->matchesOrder($validated, $order)) {
            $this->markFailed($order);

            return to_route('checkout.index')->with('error', 'Payment could not be verified.');
        }

        $order->update([
            'payment_status' => 'paid',
            'payment_transaction_id' => $validated['bank_tran_id'] ?? $request->input('val_id'),
        ]);

        return to_route('orders.success', $order);
    }

    /**
     * Handle SSLCommerz's redirect back after a failed payment.
     */
    public function fail(Request $request): RedirectResponse
    {
        $order = Order::where('order_number', $request->input('tran_id'))->first();

        if ($order) {
            $this->markFailed($order);
        }

        return to_route('checkout.index')->with('error', 'Payment failed. Please try again.');
    }

    /**
     * Handle SSLCommerz's redirect back after a cancelled payment.
     */
    public function cancel(Request $request): RedirectResponse
    {
        $order = Order::where('order_number', $request->input('tran_id'))->first();

        if ($order) {
            $this->markFailed($order);
        }

        return to_route('checkout.index')->with('error', 'Payment was cancelled.');
    }

    /**
     * Handle SSLCommerz's server-to-server IPN notification.
     */
    public function ipn(Request $request): Response
    {
        $order = Order::where('order_number', $request->input('tran_id'))->first();

        if ($order && $order->payment_status !== 'paid') {
            $validated = $this->sslCommerz->validateTransaction($request->input('val_id', ''));

            if ($validated && $this->matchesOrder($validated, $order)) {
                $order->update([
                    'payment_status' => 'paid',
                    'payment_transaction_id' => $validated['bank_tran_id'] ?? $request->input('val_id'),
                ]);
            }
        }

        return response('OK');
    }

    /**
     * Confirm a validated SSLCommerz transaction actually belongs to this order,
     * so a valid val_id from a different (e.g. attacker's own) transaction can't
     * be replayed to mark an unrelated order as paid.
     *
     * @param  array<string, mixed>  $validated
     */
    private function matchesOrder(array $validated, Order $order): bool
    {
        if (($validated['tran_id'] ?? null) !== $order->order_number) {
            return false;
        }

        return abs((float) ($validated['amount'] ?? 0) - (float) $order->total_amount) < 0.01;
    }

    /**
     * Mark the order's payment as failed and restock its items.
     */
    private function markFailed(Order $order): void
    {
        $order->update(['payment_status' => 'failed']);

        if ($order->status !== OrderStatus::Cancelled) {
            app(UpdateOrderStatus::class)->handle($order, OrderStatus::Cancelled);
        }
    }
}
