import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import OrderItemRows, {
    emptyOrderItemRow,
    findProductForVariant,
} from '@/components/admin/order-item-rows';
import type {
    CatalogProduct,
    EditableRow,
} from '@/components/admin/order-item-rows';
import OrderStatusBadge from '@/components/admin/order-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatBdt } from '@/lib/currency';
import { formatOrderCustomerId } from '@/lib/customer-id';
import {
    updateDeliveryCost,
    updateItems,
    updateStatus,
} from '@/routes/admin/orders';
import { store as storeExchange } from '@/routes/admin/orders/exchanges';
import { store as storeNote } from '@/routes/admin/orders/notes';
import { send as sendToSteadfast } from '@/routes/admin/orders/steadfast';

type OrderItemRow = {
    id: number;
    product_variant_id: number;
    product_name: string;
    size: string;
    unit_price: number;
    quantity: number;
};

type OrderNoteRow = {
    id: number;
    note: string;
    author: string;
    created_at: string;
};

type ExchangeRow = {
    id: number;
    returned: string;
    new: string;
    condition: string;
    balance_amount: number;
    author: string;
    created_at: string;
};

type OrderShowProps = {
    order: {
        order_number: string;
        source: string;
        customer_name: string;
        phone_number: string;
        city: string;
        shipping_address: string;
        zone: string;
        delivery_fee: number;
        actual_delivery_cost: number | null;
        delivery_profit: number | null;
        steadfast_consignment_id: number | null;
        steadfast_tracking_code: string | null;
        steadfast_status: string | null;
        subtotal: number;
        total_amount: number;
        payment_method: string;
        payment_transaction_id: string | null;
        payment_status: string | null;
        status: string;
        created_at: string;
        is_editable: boolean;
        is_exchangeable: boolean;
        is_delivery_cost_editable: boolean;
        user_id: number | null;
        guest_id: string | null;
        items: OrderItemRow[];
    };
    statuses: { value: string; label: string }[];
    catalog: CatalogProduct[];
    notes: OrderNoteRow[];
    exchanges: ExchangeRow[];
    exchangeBalance: number;
};

export default function AdminOrderShow({
    order,
    statuses,
    catalog,
    notes,
    exchanges,
    exchangeBalance,
}: OrderShowProps) {
    const [rows, setRows] = useState<EditableRow[]>(() =>
        order.items.map((item) => ({
            key: `existing-${item.id}`,
            product_id:
                findProductForVariant(catalog, item.product_variant_id)?.id ??
                '',
            product_variant_id: item.product_variant_id,
            quantity: item.quantity,
        })),
    );

    const [pendingStatus, setPendingStatus] = useState(order.status);
    const [syncedStatus, setSyncedStatus] = useState(order.status);
    const statusForm = useForm({ status: order.status });

    if (order.status !== syncedStatus) {
        setSyncedStatus(order.status);
        setPendingStatus(order.status);
    }

    const itemsForm = useForm<{
        items: { product_variant_id: number; quantity: number }[];
    }>({
        items: order.items.map((item) => ({
            product_variant_id: item.product_variant_id,
            quantity: item.quantity,
        })),
    });

    const submitStatus = (status: string) => {
        statusForm.setData('status', status);
        statusForm.patch(updateStatus(order.order_number).url, {
            preserveScroll: true,
        });
    };

    const applyStatus = () => {
        submitStatus(pendingStatus);
    };

    const cancelOrder = () => {
        if (
            !confirm(
                `Cancel order ${order.order_number}? This restocks all its items.`,
            )
        ) {
            return;
        }

        submitStatus('cancelled');
    };

    const updateRow = (key: string, patch: Partial<EditableRow>) => {
        setRows((current) =>
            current.map((row) =>
                row.key === key ? { ...row, ...patch } : row,
            ),
        );
    };

    const addRow = () => {
        setRows((current) => [
            ...current,
            emptyOrderItemRow(Date.now() + current.length),
        ]);
    };

    const removeRow = (key: string) => {
        setRows((current) => current.filter((row) => row.key !== key));
    };

    const previewTotal = rows.reduce((sum, row) => {
        const product = catalog.find((p) => p.id === row.product_id);

        return product ? sum + product.current_price * row.quantity : sum;
    }, 0);

    const saveItems = () => {
        const items = rows
            .filter((row) => row.product_variant_id !== '')
            .map((row) => ({
                product_variant_id: row.product_variant_id as number,
                quantity: row.quantity,
            }));

        itemsForm.transform(() => ({ items }));
        itemsForm.patch(updateItems(order.order_number).url, {
            preserveScroll: true,
        });
    };

    const deliveryCostForm = useForm<{ actual_delivery_cost: number | '' }>({
        actual_delivery_cost: order.actual_delivery_cost ?? '',
    });

    const submitDeliveryCost = () => {
        deliveryCostForm.patch(updateDeliveryCost(order.order_number).url, {
            preserveScroll: true,
        });
    };

    const steadfastForm = useForm({});
    const [steadfastError, setSteadfastError] = useState<string | null>(null);

    const submitSendToSteadfast = () => {
        setSteadfastError(null);
        steadfastForm.post(sendToSteadfast(order.order_number).url, {
            preserveScroll: true,
            onError: (errors) =>
                setSteadfastError(
                    Object.values(errors)[0] ?? 'Unable to send to SteadFast.',
                ),
        });
    };

    const noteForm = useForm({ note: '' });

    const addNote = () => {
        noteForm.post(storeNote(order.order_number).url, {
            preserveScroll: true,
            onSuccess: () => noteForm.reset('note'),
        });
    };

    const [exchangeProductId, setExchangeProductId] = useState<number | ''>('');
    const exchangeForm = useForm({
        order_item_id: '' as number | '',
        new_variant_id: '' as number | '',
        condition: 'restocked',
        shipping_charge: 0,
        notes: '',
    });
    const exchangeProduct = catalog.find((p) => p.id === exchangeProductId);

    const submitExchange = () => {
        exchangeForm.post(storeExchange(order.order_number).url, {
            preserveScroll: true,
            onSuccess: () => {
                exchangeForm.reset();
                setExchangeProductId('');
            },
        });
    };

    return (
        <>
            <Head title={`Order ${order.order_number}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold">
                            {order.order_number}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Placed {order.created_at}
                        </p>
                    </div>
                    <OrderStatusBadge
                        status={order.status}
                        label={
                            statuses.find((s) => s.value === order.status)
                                ?.label ?? order.status
                        }
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 text-sm">
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-muted-foreground">
                                Customer ID:{' '}
                                {formatOrderCustomerId(
                                    order.user_id,
                                    order.guest_id,
                                )}
                            </p>
                            <p className="text-muted-foreground">
                                {order.phone_number}
                            </p>
                            <p className="text-muted-foreground">
                                {order.shipping_address}, {order.city}
                            </p>
                            <p className="text-muted-foreground">
                                {order.zone} · {order.payment_method}
                            </p>
                            {order.payment_status && (
                                <p className="text-muted-foreground">
                                    Payment status:{' '}
                                    <span className="font-medium text-foreground capitalize">
                                        {order.payment_status}
                                    </span>
                                </p>
                            )}
                            {order.payment_transaction_id && (
                                <p className="text-muted-foreground">
                                    Txn: {order.payment_transaction_id}
                                </p>
                            )}
                            <p className="text-muted-foreground">
                                Source:{' '}
                                <span className="font-medium text-foreground">
                                    {order.source}
                                </span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center gap-3">
                            <select
                                value={pendingStatus}
                                onChange={(e) =>
                                    setPendingStatus(e.target.value)
                                }
                                disabled={statusForm.processing}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                            >
                                {statuses.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                            <Button
                                type="button"
                                disabled={
                                    statusForm.processing ||
                                    pendingStatus === order.status
                                }
                                onClick={applyStatus}
                            >
                                Done
                            </Button>
                            {order.status !== 'cancelled' && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={statusForm.processing}
                                    onClick={cancelOrder}
                                >
                                    Cancel Order
                                </Button>
                            )}
                            {statusForm.errors.status && (
                                <p className="w-full text-xs text-destructive">
                                    {statusForm.errors.status}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Items</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {!order.is_editable && (
                            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                                This order is locked for editing once shipped,
                                delivered, or cancelled.
                            </p>
                        )}

                        <OrderItemRows
                            catalog={catalog}
                            rows={rows}
                            disabled={!order.is_editable}
                            onUpdateRow={updateRow}
                            onAddRow={addRow}
                            onRemoveRow={removeRow}
                            error={itemsForm.errors.items}
                        />

                        <div className="flex items-center justify-between border-t pt-4 text-sm">
                            <div className="text-muted-foreground">
                                Delivery fee: {formatBdt(order.delivery_fee)}
                            </div>
                            <div className="font-semibold">
                                Estimated total:{' '}
                                {formatBdt(previewTotal + order.delivery_fee)}
                            </div>
                        </div>

                        {order.is_editable && (
                            <Button
                                type="button"
                                onClick={saveItems}
                                disabled={itemsForm.processing}
                                className="w-fit"
                            >
                                Save Items
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {order.is_delivery_cost_editable && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Cost</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex flex-wrap gap-6 text-sm">
                                <div>
                                    <p className="text-muted-foreground">
                                        Charged to customer
                                    </p>
                                    <p className="font-medium">
                                        {formatBdt(order.delivery_fee)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Actual courier cost
                                    </p>
                                    <p className="font-medium">
                                        {order.actual_delivery_cost !== null
                                            ? formatBdt(
                                                  order.actual_delivery_cost,
                                              )
                                            : 'Not recorded yet'}
                                    </p>
                                </div>
                                {order.delivery_profit !== null && (
                                    <div>
                                        <p className="text-muted-foreground">
                                            Delivery profit
                                        </p>
                                        <p
                                            className={
                                                order.delivery_profit < 0
                                                    ? 'font-medium text-destructive'
                                                    : 'font-medium'
                                            }
                                        >
                                            {order.delivery_profit < 0
                                                ? '-'
                                                : ''}
                                            {formatBdt(
                                                Math.abs(
                                                    order.delivery_profit,
                                                ),
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="Actual courier cost"
                                    value={
                                        deliveryCostForm.data
                                            .actual_delivery_cost
                                    }
                                    onChange={(e) =>
                                        deliveryCostForm.setData(
                                            'actual_delivery_cost',
                                            e.target.value === ''
                                                ? ''
                                                : Number(e.target.value),
                                        )
                                    }
                                    className="w-48"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={
                                        deliveryCostForm.processing ||
                                        deliveryCostForm.data
                                            .actual_delivery_cost === ''
                                    }
                                    onClick={submitDeliveryCost}
                                >
                                    Save Courier Cost
                                </Button>
                                {deliveryCostForm.errors
                                    .actual_delivery_cost && (
                                    <p className="w-full text-xs text-destructive">
                                        {
                                            deliveryCostForm.errors
                                                .actual_delivery_cost
                                        }
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {order.status !== 'cancelled' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Courier (SteadFast)</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {order.steadfast_consignment_id !== null ? (
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">
                                            Consignment ID
                                        </p>
                                        <p className="font-medium">
                                            {order.steadfast_consignment_id}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">
                                            Tracking code
                                        </p>
                                        <p className="font-medium">
                                            {order.steadfast_tracking_code}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">
                                            Status
                                        </p>
                                        <p className="font-medium capitalize">
                                            {order.steadfast_status}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={steadfastForm.processing}
                                        onClick={submitSendToSteadfast}
                                    >
                                        Send to SteadFast
                                    </Button>
                                    {steadfastError && (
                                        <p className="w-full text-xs text-destructive">
                                            {steadfastError}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {notes.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No notes yet.
                            </p>
                        ) : (
                            <div className="flex flex-col divide-y">
                                {notes.map((note) => (
                                    <div
                                        key={note.id}
                                        className="py-2.5 text-sm"
                                    >
                                        <p>{note.note}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {note.author} · {note.created_at}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col gap-2 border-t pt-4">
                            <textarea
                                value={noteForm.data.note}
                                onChange={(e) =>
                                    noteForm.setData('note', e.target.value)
                                }
                                rows={2}
                                placeholder="e.g. Customer confirmed address via Messenger"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                            {noteForm.errors.note && (
                                <p className="text-xs text-destructive">
                                    {noteForm.errors.note}
                                </p>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-fit"
                                disabled={
                                    noteForm.processing || !noteForm.data.note
                                }
                                onClick={addNote}
                            >
                                Add Note
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {order.is_exchangeable && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Exchanges</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {exchanges.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No exchanges yet.
                                </p>
                            ) : (
                                <div className="flex flex-col divide-y">
                                    {exchanges.map((exchange) => (
                                        <div
                                            key={exchange.id}
                                            className="py-2.5 text-sm"
                                        >
                                            <p>
                                                {exchange.returned} →{' '}
                                                {exchange.new} (
                                                {exchange.condition})
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Balance:{' '}
                                                {formatBdt(
                                                    Math.abs(
                                                        exchange.balance_amount,
                                                    ),
                                                )}{' '}
                                                {exchange.balance_amount < 0
                                                    ? 'refund due'
                                                    : 'owed by customer'}{' '}
                                                · {exchange.author} ·{' '}
                                                {exchange.created_at}
                                            </p>
                                        </div>
                                    ))}
                                    <p className="pt-2.5 text-sm font-semibold">
                                        Total exchange balance:{' '}
                                        {formatBdt(Math.abs(exchangeBalance))}{' '}
                                        {exchangeBalance < 0
                                            ? 'refund due'
                                            : 'owed by customer'}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-2 border-t pt-4 sm:grid-cols-[2fr_2fr_1fr_1fr_auto]">
                                <select
                                    value={exchangeForm.data.order_item_id}
                                    onChange={(e) =>
                                        exchangeForm.setData(
                                            'order_item_id',
                                            e.target.value
                                                ? Number(e.target.value)
                                                : '',
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                                >
                                    <option value="">Item to return</option>
                                    {order.items.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.product_name} (EU {item.size})
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={exchangeProductId}
                                    onChange={(e) => {
                                        setExchangeProductId(
                                            e.target.value
                                                ? Number(e.target.value)
                                                : '',
                                        );
                                        exchangeForm.setData(
                                            'new_variant_id',
                                            '',
                                        );
                                    }}
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                                >
                                    <option value="">New product</option>
                                    {catalog.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.brand} — {p.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={exchangeForm.data.new_variant_id}
                                    disabled={!exchangeProduct}
                                    onChange={(e) =>
                                        exchangeForm.setData(
                                            'new_variant_id',
                                            e.target.value
                                                ? Number(e.target.value)
                                                : '',
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                                >
                                    <option value="">New size</option>
                                    {exchangeProduct?.variants.map(
                                        (variant) => (
                                            <option
                                                key={variant.id}
                                                value={variant.id}
                                            >
                                                EU {variant.size} (
                                                {variant.stock_quantity} in
                                                stock)
                                            </option>
                                        ),
                                    )}
                                </select>

                                <select
                                    value={exchangeForm.data.condition}
                                    onChange={(e) =>
                                        exchangeForm.setData(
                                            'condition',
                                            e.target.value,
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                                >
                                    <option value="restocked">Restocked</option>
                                    <option value="damaged">Damaged</option>
                                </select>

                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="Ship fee"
                                    value={exchangeForm.data.shipping_charge}
                                    onChange={(e) =>
                                        exchangeForm.setData(
                                            'shipping_charge',
                                            Number(e.target.value) || 0,
                                        )
                                    }
                                />
                            </div>

                            <textarea
                                value={exchangeForm.data.notes}
                                onChange={(e) =>
                                    exchangeForm.setData(
                                        'notes',
                                        e.target.value,
                                    )
                                }
                                rows={2}
                                placeholder="Reason for exchange (optional)"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />

                            {(exchangeForm.errors.order_item_id ||
                                exchangeForm.errors.new_variant_id) && (
                                <p className="text-xs text-destructive">
                                    {exchangeForm.errors.order_item_id ??
                                        exchangeForm.errors.new_variant_id}
                                </p>
                            )}

                            <Button
                                type="button"
                                className="w-fit"
                                disabled={
                                    exchangeForm.processing ||
                                    !exchangeForm.data.order_item_id ||
                                    !exchangeForm.data.new_variant_id
                                }
                                onClick={submitExchange}
                            >
                                Process Exchange
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
