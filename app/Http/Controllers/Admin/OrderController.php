<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\UpdateOrderItems;
use App\Actions\Admin\UpdateOrderStatus;
use App\Actions\Store\PlaceOrder;
use App\Enums\DeliveryZone;
use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreManualOrderRequest;
use App\Http\Requests\Admin\StoreOrderNoteRequest;
use App\Http\Requests\Admin\UpdateDeliveryCostRequest;
use App\Http\Requests\Admin\UpdateOrderItemsRequest;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Models\ExchangeRecord;
use App\Models\Order;
use App\Models\OrderNote;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display the admin order list, filterable by status tab and search term.
     */
    public function index(Request $request): Response
    {
        $status = $request->string('status')->trim()->toString();
        $search = $request->string('q')->trim()->toString();

        $orders = Order::query()
            ->when($status !== '' && $status !== 'all', fn ($query) => $query->where('status', $status))
            ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                ->where('order_number', 'like', "%{$search}%")
                ->orWhere('customer_name', 'like', "%{$search}%")
                ->orWhere('phone_number', 'like', "%{$search}%")))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Order $order) => [
                'order_number' => $order->order_number,
                'source' => $order->source->label(),
                'customer_name' => $order->customer_name,
                'phone_number' => $order->phone_number,
                'city' => $order->city,
                'total_amount' => $order->total_amount,
                'status' => $order->status->value,
                'created_at' => $order->created_at->toDayDateTimeString(),
                'user_id' => $order->user_id,
                'guest_id' => $order->guest_id,
            ]);

        $counts = Order::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'statusFilter' => $status === '' ? 'all' : $status,
            'search' => $search,
            'tabs' => collect(OrderStatus::cases())
                ->map(fn (OrderStatus $case) => [
                    'value' => $case->value,
                    'label' => $case->label(),
                    'count' => $counts->get($case->value, 0),
                ])
                ->prepend(['value' => 'all', 'label' => 'All', 'count' => $counts->sum()]),
        ]);
    }

    /**
     * Display the form for creating a manual (chat/phone) order.
     */
    public function create(): Response
    {
        return Inertia::render('admin/orders/create', [
            'catalog' => $this->catalogForOrderForm(),
            'zones' => collect(DeliveryZone::cases())->map(fn (DeliveryZone $zone) => [
                'value' => $zone->value,
                'label' => $zone->label(),
                'fee' => $zone->fee(),
            ]),
            'sources' => collect(OrderSource::cases())->map(fn (OrderSource $case) => [
                'value' => $case->value,
                'label' => $case->label(),
            ]),
            'paymentMethods' => collect([PaymentMethod::CashOnDelivery, PaymentMethod::Bkash, PaymentMethod::Nagad])
                ->map(fn (PaymentMethod $method) => [
                    'value' => $method->value,
                    'label' => $method->label(),
                ]),
        ]);
    }

    /**
     * Store a manually-entered order (from WhatsApp/Messenger/phone), reusing the same
     * stock-locking placement logic as a normal storefront checkout.
     */
    public function storeManual(StoreManualOrderRequest $request, PlaceOrder $placeOrder): RedirectResponse
    {
        $order = $placeOrder->handle(
            customerName: $request->validated('customer_name'),
            phoneNumber: $request->validated('phone_number'),
            city: $request->validated('city'),
            shippingAddress: $request->validated('shipping_address'),
            zone: DeliveryZone::from($request->validated('zone')),
            paymentMethod: PaymentMethod::from($request->validated('payment_method')),
            paymentTransactionId: $request->validated('payment_transaction_id'),
            items: collect($request->validated('items'))
                ->map(fn (array $item) => [
                    'variant_id' => $item['product_variant_id'],
                    'quantity' => $item['quantity'],
                ])
                ->all(),
            paymentStatus: $request->validated('payment_status'),
            source: OrderSource::from($request->validated('source')),
        );

        $order->notes()->create([
            'user_id' => $request->user()->id,
            'note' => "Order created manually via {$order->source->label()}.",
        ]);

        return to_route('admin.orders.show', ['order' => $order->order_number])->with('status', 'Order created.');
    }

    /**
     * Display the given order with an editable line-item form.
     */
    public function show(Order $order): Response
    {
        $order->load('items.variant');

        return Inertia::render('admin/orders/show', [
            'order' => [
                'order_number' => $order->order_number,
                'source' => $order->source->label(),
                'customer_name' => $order->customer_name,
                'phone_number' => $order->phone_number,
                'city' => $order->city,
                'shipping_address' => $order->shipping_address,
                'zone' => $order->zone->label(),
                'delivery_fee' => $order->delivery_fee,
                'actual_delivery_cost' => $order->actual_delivery_cost,
                'delivery_profit' => $order->deliveryProfit(),
                'subtotal' => $order->subtotal,
                'total_amount' => $order->total_amount,
                'payment_method' => $order->payment_method->label(),
                'payment_transaction_id' => $order->payment_transaction_id,
                'payment_status' => $order->payment_status,
                'status' => $order->status->value,
                'created_at' => $order->created_at->toDayDateTimeString(),
                'is_editable' => in_array($order->status, [OrderStatus::Pending, OrderStatus::Processing], true),
                'is_exchangeable' => in_array($order->status, [OrderStatus::Shipped, OrderStatus::Delivered], true),
                'is_delivery_cost_editable' => in_array($order->status, [OrderStatus::Shipped, OrderStatus::Delivered], true),
                'user_id' => $order->user_id,
                'guest_id' => $order->guest_id,
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name' => $item->product_name,
                    'size' => $item->size,
                    'unit_price' => $item->unit_price,
                    'quantity' => $item->quantity,
                ]),
            ],
            'statuses' => collect(OrderStatus::cases())->map(fn (OrderStatus $case) => [
                'value' => $case->value,
                'label' => $case->label(),
            ]),
            'catalog' => $this->catalogForOrderForm(),
            'notes' => $order->notes()->with('user')->latest()->get()->map(fn (OrderNote $note) => [
                'id' => $note->id,
                'note' => $note->note,
                'author' => $note->user?->name ?? 'System',
                'created_at' => $note->created_at->diffForHumans(),
            ]),
            'exchanges' => $order->exchanges()
                ->with(['returnedVariant.product', 'newVariant.product', 'user'])
                ->latest()
                ->get()
                ->map(fn (ExchangeRecord $exchange) => [
                    'id' => $exchange->id,
                    'returned' => "{$exchange->returnedVariant->product->name} (EU {$exchange->returnedVariant->size})",
                    'new' => "{$exchange->newVariant->product->name} (EU {$exchange->newVariant->size})",
                    'condition' => $exchange->condition->label(),
                    'balance_amount' => $exchange->balance_amount,
                    'author' => $exchange->user?->name ?? 'System',
                    'created_at' => $exchange->created_at->diffForHumans(),
                ]),
            'exchangeBalance' => (int) $order->exchanges()->sum('balance_amount'),
        ]);
    }

    /**
     * Log a freeform note on the given order (e.g. "Customer confirmed address via Messenger").
     */
    public function storeNote(StoreOrderNoteRequest $request, Order $order): RedirectResponse
    {
        $order->notes()->create([
            'user_id' => $request->user()->id,
            'note' => $request->validated('note'),
        ]);

        return back()->with('status', 'Note added.');
    }

    /**
     * Build the product/variant catalog shared by the manual-order-creation and
     * order-item-editing forms.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function catalogForOrderForm(): Collection
    {
        return Product::query()
            ->with(['brand', 'variants'])
            ->orderBy('name')
            ->get()
            ->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'brand' => $product->brand->name,
                'current_price' => $product->currentPrice(),
                'variants' => $product->variants->map(fn ($variant) => [
                    'id' => $variant->id,
                    'size' => $variant->size,
                    'stock_quantity' => $variant->stock_quantity,
                ]),
            ]);
    }

    /**
     * Update the order's status (including cancelling / reopening it).
     */
    public function updateStatus(UpdateOrderStatusRequest $request, Order $order, UpdateOrderStatus $action): RedirectResponse
    {
        $action->handle($order, OrderStatus::from($request->validated('status')));

        return back()->with('status', 'Order status updated.');
    }

    /**
     * Update the order's line items (product/size/quantity changes).
     */
    public function updateItems(UpdateOrderItemsRequest $request, Order $order, UpdateOrderItems $action): RedirectResponse
    {
        $action->handle($order, $request->validated('items'));

        return back()->with('status', 'Order items updated.');
    }

    /**
     * Record the actual courier cost for a shipped/delivered order, so its delivery profit
     * (customer-charged fee minus courier cost) can be tracked.
     */
    public function updateDeliveryCost(UpdateDeliveryCostRequest $request, Order $order): RedirectResponse
    {
        if (! in_array($order->status, [OrderStatus::Shipped, OrderStatus::Delivered], true)) {
            throw ValidationException::withMessages([
                'actual_delivery_cost' => 'Courier cost can only be recorded once the order has shipped.',
            ]);
        }

        $actualDeliveryCost = $request->validated('actual_delivery_cost');

        $order->update(['actual_delivery_cost' => $actualDeliveryCost]);

        $profit = $order->delivery_fee - $actualDeliveryCost;

        $order->notes()->create([
            'user_id' => $request->user()->id,
            'note' => sprintf(
                'Courier cost recorded: ৳%d (charged ৳%d — %s ৳%d).',
                $actualDeliveryCost,
                $order->delivery_fee,
                $profit >= 0 ? 'profit' : 'loss',
                abs($profit),
            ),
        ]);

        return back()->with('status', 'Delivery cost recorded.');
    }
}
