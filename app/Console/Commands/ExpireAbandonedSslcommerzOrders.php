<?php

namespace App\Console\Commands;

use App\Actions\Admin\UpdateOrderStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Models\Order;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:expire-abandoned-sslcommerz-orders')]
#[Description('Cancel and restock SSLCommerz orders left pending too long (customer never completed or abandoned the gateway)')]
class ExpireAbandonedSslcommerzOrders extends Command
{
    /**
     * How long a pending SSLCommerz order is given to complete before it's expired.
     */
    private const EXPIRE_AFTER_MINUTES = 60;

    /**
     * Execute the console command.
     */
    public function handle(UpdateOrderStatus $updateOrderStatus): int
    {
        $orders = Order::query()
            ->where('payment_method', PaymentMethod::Sslcommerz)
            ->where('payment_status', 'pending')
            ->where('status', OrderStatus::Pending)
            ->where('created_at', '<', now()->subMinutes(self::EXPIRE_AFTER_MINUTES))
            ->get();

        foreach ($orders as $order) {
            $order->update(['payment_status' => 'failed']);
            $updateOrderStatus->handle($order, OrderStatus::Cancelled);
        }

        $this->info("Expired {$orders->count()} abandoned SSLCommerz order(s).");

        return self::SUCCESS;
    }
}
