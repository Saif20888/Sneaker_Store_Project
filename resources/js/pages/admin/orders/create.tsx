import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import OrderItemRows, {
    emptyOrderItemRow,
} from '@/components/admin/order-item-rows';
import type {
    CatalogProduct,
    EditableRow,
} from '@/components/admin/order-item-rows';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/admin/orders';

type Option = { value: string; label: string };

type CreateManualOrderProps = {
    catalog: CatalogProduct[];
    zones: (Option & { fee: number })[];
    sources: Option[];
    paymentMethods: Option[];
};

type ManualOrderForm = {
    customer_name: string;
    phone_number: string;
    city: string;
    shipping_address: string;
    zone: string;
    source: string;
    payment_method: string;
    payment_transaction_id: string;
    payment_status: string;
    items: { product_variant_id: number; quantity: number }[];
};

export default function AdminOrdersCreate({
    catalog,
    zones,
    sources,
    paymentMethods,
}: CreateManualOrderProps) {
    const [rows, setRows] = useState<EditableRow[]>([emptyOrderItemRow(0)]);

    const { data, setData, post, transform, processing, errors } =
        useForm<ManualOrderForm>({
            customer_name: '',
            phone_number: '',
            city: '',
            shipping_address: '',
            zone: zones[0]?.value ?? '',
            source:
                sources.find((s) => s.value === 'messenger')?.value ??
                sources[0]?.value ??
                '',
            payment_method: paymentMethods[0]?.value ?? 'cod',
            payment_transaction_id: '',
            payment_status: 'pending',
            items: [],
        });

    const updateRow = (key: string, patch: Partial<EditableRow>) => {
        setRows((current) =>
            current.map((row) =>
                row.key === key ? { ...row, ...patch } : row,
            ),
        );
    };

    const addRow = () => {
        setRows((current) => [...current, emptyOrderItemRow(Date.now())]);
    };

    const removeRow = (key: string) => {
        setRows((current) => current.filter((row) => row.key !== key));
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const items = rows
            .filter((row) => row.product_variant_id !== '')
            .map((row) => ({
                product_variant_id: row.product_variant_id as number,
                quantity: row.quantity,
            }));

        transform((formData) => ({ ...formData, items }));
        post(store().url);
    };

    return (
        <>
            <Head title="Add Manual Order" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-xl font-bold">Add Manual Order</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter an order taken over WhatsApp, Messenger, or phone.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="flex max-w-3xl flex-col gap-6"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="customer_name">Customer Name</Label>
                            <Input
                                id="customer_name"
                                value={data.customer_name}
                                onChange={(e) =>
                                    setData('customer_name', e.target.value)
                                }
                                required
                            />
                            {errors.customer_name && (
                                <p className="text-xs text-destructive">
                                    {errors.customer_name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone_number">Phone</Label>
                            <Input
                                id="phone_number"
                                value={data.phone_number}
                                onChange={(e) =>
                                    setData('phone_number', e.target.value)
                                }
                                placeholder="01XXXXXXXXX"
                                required
                            />
                            {errors.phone_number && (
                                <p className="text-xs text-destructive">
                                    {errors.phone_number}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={data.city}
                                onChange={(e) =>
                                    setData('city', e.target.value)
                                }
                                required
                            />
                            {errors.city && (
                                <p className="text-xs text-destructive">
                                    {errors.city}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="zone">Shipping Zone</Label>
                            <select
                                id="zone"
                                value={data.zone}
                                onChange={(e) =>
                                    setData('zone', e.target.value)
                                }
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                            >
                                {zones.map((zone) => (
                                    <option key={zone.value} value={zone.value}>
                                        {zone.label} (৳{zone.fee})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="shipping_address">
                            Shipping Address
                        </Label>
                        <textarea
                            id="shipping_address"
                            rows={2}
                            value={data.shipping_address}
                            onChange={(e) =>
                                setData('shipping_address', e.target.value)
                            }
                            required
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        />
                        {errors.shipping_address && (
                            <p className="text-xs text-destructive">
                                {errors.shipping_address}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="source">Order Source</Label>
                        <select
                            id="source"
                            value={data.source}
                            onChange={(e) => setData('source', e.target.value)}
                            className="h-9 w-fit rounded-md border border-input bg-background px-3 text-sm text-foreground"
                        >
                            {sources.map((source) => (
                                <option key={source.value} value={source.value}>
                                    {source.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Items</Label>
                        <OrderItemRows
                            catalog={catalog}
                            rows={rows}
                            onUpdateRow={updateRow}
                            onAddRow={addRow}
                            onRemoveRow={removeRow}
                            error={errors.items}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="payment_method">
                                Payment Method
                            </Label>
                            <select
                                id="payment_method"
                                value={data.payment_method}
                                onChange={(e) =>
                                    setData('payment_method', e.target.value)
                                }
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                            >
                                {paymentMethods.map((method) => (
                                    <option
                                        key={method.value}
                                        value={method.value}
                                    >
                                        {method.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {data.payment_method !== 'cod' && (
                            <div className="grid gap-2">
                                <Label htmlFor="payment_transaction_id">
                                    Transaction ID
                                </Label>
                                <Input
                                    id="payment_transaction_id"
                                    value={data.payment_transaction_id}
                                    onChange={(e) =>
                                        setData(
                                            'payment_transaction_id',
                                            e.target.value,
                                        )
                                    }
                                />
                                {errors.payment_transaction_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.payment_transaction_id}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="payment_status">
                                Payment Status
                            </Label>
                            <select
                                id="payment_status"
                                value={data.payment_status}
                                onChange={(e) =>
                                    setData('payment_status', e.target.value)
                                }
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-fit"
                    >
                        Create Order
                    </Button>
                </form>
            </div>
        </>
    );
}
