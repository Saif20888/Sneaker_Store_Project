import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import CheckoutController from '@/actions/App/Http/Controllers/Store/CheckoutController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useCart } from '@/hooks/use-cart';
import { formatBdt } from '@/lib/currency';
import { index as shopIndex } from '@/routes/products';

const MERCHANT_NUMBER = '01601-638822';

type CheckoutProps = {
    zones: { value: string; label: string; fee: number }[];
    paymentMethods: { value: string; label: string }[];
};

export default function Checkout({ zones, paymentMethods }: CheckoutProps) {
    const { items, subtotal, zone, setZone } = useCart();
    const [paymentMethod, setPaymentMethod] = useState(
        paymentMethods[0]?.value ?? 'cod',
    );

    const selectedZone = zones.find((z) => z.value === zone) ?? zones[0];
    const deliveryFee = selectedZone?.fee ?? 0;
    const total = subtotal + deliveryFee;

    if (items.length === 0) {
        return (
            <>
                <Head title="Checkout" />
                <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
                    <h1 className="text-xl font-extrabold tracking-tight uppercase">
                        Your bag is empty
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Add something to your bag before checking out.
                    </p>
                    <Button
                        asChild
                        className="rounded-sm bg-store-ink text-store-bone hover:bg-store-ink/90"
                    >
                        <Link href={shopIndex()}>Continue Shopping</Link>
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Checkout" />

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
                <h1 className="mb-8 text-2xl font-extrabold tracking-tight uppercase">
                    Checkout
                </h1>

                <div className="grid gap-10 lg:grid-cols-5">
                    <Form
                        {...CheckoutController.store.form()}
                        options={{ preserveScroll: true }}
                        className="flex flex-col gap-6 lg:col-span-3"
                    >
                        {({ processing, errors }) => (
                            <>
                                <input type="hidden" name="zone" value={zone} />
                                <input
                                    type="hidden"
                                    name="payment_method"
                                    value={paymentMethod}
                                />

                                <div className="grid gap-2">
                                    <Label htmlFor="customer_name">
                                        Full Name
                                    </Label>
                                    <Input
                                        id="customer_name"
                                        name="customer_name"
                                        required
                                        placeholder="Your name"
                                        className="rounded-sm"
                                    />
                                    <InputError
                                        message={errors.customer_name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone_number">
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone_number"
                                        name="phone_number"
                                        required
                                        placeholder="01XXXXXXXXX"
                                        className="rounded-sm"
                                    />
                                    <InputError message={errors.phone_number} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="city">
                                        District / City
                                    </Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        required
                                        placeholder="Dhaka"
                                        className="rounded-sm"
                                    />
                                    <InputError message={errors.city} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="shipping_address">
                                        Full Street Address
                                    </Label>
                                    <textarea
                                        id="shipping_address"
                                        name="shipping_address"
                                        required
                                        rows={3}
                                        placeholder="House, road, area"
                                        className="w-full rounded-sm border border-input bg-white px-3 py-2 text-sm text-store-ink shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    />
                                    <InputError
                                        message={errors.shipping_address}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Delivery Zone</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {zones.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    setZone(
                                                        option.value as
                                                            | 'inside_dhaka'
                                                            | 'outside_dhaka',
                                                    )
                                                }
                                                className={`rounded-sm border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                                                    zone === option.value
                                                        ? 'border-store-ink bg-store-ink text-store-bone'
                                                        : 'border-store-gray hover:border-store-ink'
                                                }`}
                                            >
                                                {option.label}
                                                <span className="block text-xs opacity-70">
                                                    {formatBdt(option.fee)}{' '}
                                                    delivery
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <InputError message={errors.zone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Payment Method</Label>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        {paymentMethods.map((method) => (
                                            <button
                                                key={method.value}
                                                type="button"
                                                onClick={() =>
                                                    setPaymentMethod(
                                                        method.value,
                                                    )
                                                }
                                                className={`rounded-sm border px-3 py-2.5 text-sm font-medium transition-colors ${
                                                    paymentMethod ===
                                                    method.value
                                                        ? 'border-store-ink bg-store-ink text-store-bone'
                                                        : 'border-store-gray hover:border-store-ink'
                                                }`}
                                            >
                                                {method.label}
                                            </button>
                                        ))}
                                    </div>
                                    <InputError
                                        message={errors.payment_method}
                                    />
                                </div>

                                {paymentMethod !== 'cod' &&
                                    paymentMethod !== 'sslcommerz' && (
                                        <div className="border border-store-alert/40 bg-store-alert/10 px-4 py-3 text-sm">
                                            <p className="font-semibold text-store-alert">
                                                {
                                                    paymentMethods.find(
                                                        (m) =>
                                                            m.value ===
                                                            paymentMethod,
                                                    )?.label
                                                }{' '}
                                                Instructions
                                            </p>
                                            <p className="mt-1 text-muted-foreground">
                                                Send {formatBdt(total)} to{' '}
                                                <span className="font-semibold">
                                                    {MERCHANT_NUMBER}
                                                </span>{' '}
                                                (Personal) using the &quot;Send
                                                Money&quot; option, then enter
                                                the transaction ID below.
                                            </p>
                                            <div className="mt-3 grid gap-1.5">
                                                <Label
                                                    htmlFor="payment_transaction_id"
                                                    className="text-xs"
                                                >
                                                    Transaction ID
                                                </Label>
                                                <Input
                                                    id="payment_transaction_id"
                                                    name="payment_transaction_id"
                                                    placeholder="e.g. 8N7A6XYZ12"
                                                    className="rounded-sm bg-white text-store-ink"
                                                />
                                                <InputError
                                                    message={
                                                        errors.payment_transaction_id
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}

                                {paymentMethod === 'sslcommerz' && (
                                    <div className="border border-store-gray bg-store-cream/40 px-4 py-3 text-sm text-muted-foreground">
                                        You&apos;ll be redirected to complete
                                        payment securely, then brought back here
                                        automatically.
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={processing}
                                    className="rounded-sm bg-store-ink text-store-bone hover:bg-store-ink/90"
                                >
                                    {processing && (
                                        <Spinner className="text-store-bone" />
                                    )}
                                    Place Order
                                </Button>
                            </>
                        )}
                    </Form>

                    <div className="h-fit border border-store-gray bg-store-gray/20 p-5 lg:col-span-2">
                        <h2 className="text-xs font-semibold tracking-wide uppercase">
                            Order Summary
                        </h2>
                        <ul className="mt-4 flex flex-col gap-3">
                            {items.map((item) => (
                                <li
                                    key={item.variant_id}
                                    className="flex justify-between gap-2 text-sm"
                                >
                                    <span className="text-muted-foreground">
                                        {item.product_name}{' '}
                                        <span className="text-xs">
                                            (EU {item.size} × {item.quantity})
                                        </span>
                                    </span>
                                    <span className="font-medium">
                                        {formatBdt(item.line_total)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 flex flex-col gap-1 border-t border-store-gray pt-3 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{formatBdt(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Delivery ({selectedZone?.label})</span>
                                <span>{formatBdt(deliveryFee)}</span>
                            </div>
                            <div className="flex justify-between border-t border-store-gray pt-1 text-base font-bold">
                                <span>Total</span>
                                <span>{formatBdt(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
