<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $order->order_number }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #1a1a1a; }
        h1 { font-size: 20px; margin-bottom: 0; }
        .muted { color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; text-transform: uppercase; font-size: 10px; }
        .totals td { border-bottom: none; }
        .totals .label { text-align: right; }
        .grand-total { font-weight: bold; font-size: 14px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>Vint-Edge</h1>
    <p class="muted">Invoice for Order #{{ $order->order_number }}</p>

    <table style="margin-top: 10px;">
        <tr>
            <td><strong>Billed To</strong><br>
                {{ $order->customer_name }}<br>
                {{ $order->phone_number }}<br>
                {{ $order->shipping_address }}, {{ $order->city }}
            </td>
            <td><strong>Order Details</strong><br>
                Date: {{ $order->created_at->toDayDateTimeString() }}<br>
                Payment: {{ $order->payment_method->label() }}<br>
                Status: {{ $order->status->label() }}
            </td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($order->items as $item)
                <tr>
                    <td>{{ $item->product_name }}</td>
                    <td>EU {{ $item->size }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>৳{{ number_format($item->unit_price) }}</td>
                    <td>৳{{ number_format($item->unit_price * $item->quantity) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td class="label">Subtotal</td>
            <td>৳{{ number_format($order->subtotal) }}</td>
        </tr>
        <tr>
            <td class="label">Delivery</td>
            <td>৳{{ number_format($order->delivery_fee) }}</td>
        </tr>
        <tr class="grand-total">
            <td class="label">Total</td>
            <td>৳{{ number_format($order->total_amount) }}</td>
        </tr>
    </table>

    <p class="muted" style="margin-top: 30px;">Thank you for shopping with Vint-Edge.</p>
</body>
</html>
