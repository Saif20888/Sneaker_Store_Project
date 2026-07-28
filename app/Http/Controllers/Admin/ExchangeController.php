<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\ProcessExchange;
use App\Enums\ExchangeCondition;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreExchangeRequest;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\RedirectResponse;

class ExchangeController extends Controller
{
    /**
     * Process a post-delivery size exchange for the given order.
     */
    public function store(StoreExchangeRequest $request, Order $order, ProcessExchange $action): RedirectResponse
    {
        $item = OrderItem::query()->findOrFail($request->validated('order_item_id'));

        $action->handle(
            order: $order,
            item: $item,
            newVariantId: $request->validated('new_variant_id'),
            condition: ExchangeCondition::from($request->validated('condition')),
            shippingCharge: (int) ($request->validated('shipping_charge') ?? 0),
            notes: $request->validated('notes'),
        );

        return back()->with('status', 'Exchange processed.');
    }
}
