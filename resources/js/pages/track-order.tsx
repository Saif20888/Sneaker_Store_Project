import { Head, router } from '@inertiajs/react';
import { CheckCircle2, CircleDashed, PackageSearch } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatBdt } from '@/lib/currency';
import { index as trackOrderIndex } from '@/routes/track-order';

const STEPS = ['Order Placed', 'Packed', 'Out for Delivery', 'Delivered'];

type TrackedOrder = {
    order_number: string;
    status: string;
    status_label: string;
    tracking_step: number | null;
    zone: string;
    estimated_delivery: string;
    total_amount: number;
    created_at: string;
    items: { product_name: string; size: string; quantity: number }[];
};

type TrackOrderProps = {
    query?: { order_number?: string; phone_number?: string };
    order?: TrackedOrder | null;
    notFound?: boolean;
};

export default function TrackOrder({
    query,
    order,
    notFound,
}: TrackOrderProps) {
    const [orderNumber, setOrderNumber] = useState(query?.order_number ?? '');
    const [phoneNumber, setPhoneNumber] = useState(query?.phone_number ?? '');

    const submit = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            trackOrderIndex().url,
            { order_number: orderNumber, phone_number: phoneNumber },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Track Your Order" />

            <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="text-center">
                    <PackageSearch className="mx-auto size-8 text-muted-foreground" />
                    <h1 className="mt-2 text-2xl font-extrabold tracking-tight uppercase">
                        Track Your Order
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Enter your Order ID and phone number to see live
                        progress.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="mx-auto mt-8 flex max-w-md flex-col gap-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="order_number">Order ID</Label>
                        <Input
                            id="order_number"
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                            placeholder="VNT-8921ABCD"
                            required
                            className="rounded-sm"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                            id="phone_number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            required
                            className="rounded-sm"
                        />
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        className="rounded-sm bg-store-ink text-store-bone hover:bg-store-ink/90"
                    >
                        Track Order
                    </Button>
                </form>

                {notFound && (
                    <p className="mt-8 text-center text-sm text-store-alert">
                        No order found matching that Order ID and phone number.
                        Double-check and try again.
                    </p>
                )}

                {order && (
                    <div className="mt-10 border border-store-gray p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">
                                Order #{order.order_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {order.created_at}
                            </p>
                        </div>

                        {order.status === 'cancelled' ? (
                            <p className="mt-6 text-sm font-semibold text-store-alert">
                                This order was cancelled.
                            </p>
                        ) : (
                            <ol className="mt-6 flex items-center justify-between">
                                {STEPS.map((step, index) => {
                                    const stepNumber = index + 1;
                                    const isComplete =
                                        (order.tracking_step ?? 0) >=
                                        stepNumber;

                                    return (
                                        <li
                                            key={step}
                                            className="flex flex-1 flex-col items-center gap-1.5 text-center"
                                        >
                                            {isComplete ? (
                                                <CheckCircle2 className="size-6 text-green-600" />
                                            ) : (
                                                <CircleDashed className="size-6 text-muted-foreground" />
                                            )}
                                            <span
                                                className={`text-[11px] font-medium ${isComplete ? 'text-store-ink' : 'text-muted-foreground'}`}
                                            >
                                                {step}
                                            </span>
                                            {index < STEPS.length - 1 && (
                                                <span className="hidden h-px w-full bg-store-gray sm:block" />
                                            )}
                                        </li>
                                    );
                                })}
                            </ol>
                        )}

                        <ul className="mt-8 divide-y divide-store-gray border-t border-store-gray">
                            {order.items.map((item, index) => (
                                <li
                                    key={index}
                                    className="flex justify-between py-2 text-sm text-muted-foreground"
                                >
                                    <span>
                                        {item.product_name} (EU {item.size} ×{' '}
                                        {item.quantity})
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-4 flex justify-between border-t border-store-gray pt-3 text-sm">
                            <span className="text-muted-foreground">
                                Delivery to {order.zone}
                            </span>
                            <span className="font-medium">
                                {order.estimated_delivery}
                            </span>
                        </div>
                        <div className="mt-1 flex justify-between text-base font-bold">
                            <span>Total</span>
                            <span>{formatBdt(order.total_amount)}</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
