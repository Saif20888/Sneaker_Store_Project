import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBdt } from '@/lib/currency';
import { home } from '@/routes';
import { invoice } from '@/routes/orders';

type OrderProps = {
    order: {
        order_number: string;
        customer_name: string;
        phone_number: string;
        city: string;
        shipping_address: string;
        zone: string;
        delivery_fee: number;
        estimated_delivery: string;
        subtotal: number;
        total_amount: number;
        payment_method: string;
        payment_transaction_id: string | null;
        status: string;
        created_at: string;
        guest_id: string | null;
        items: {
            product_name: string;
            size: string;
            unit_price: number;
            quantity: number;
        }[];
    };
};

export default function OrderShow({ order }: OrderProps) {
    return (
        <>
            <Head title={`Order ${order.order_number}`} />

            <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-3 text-center">
                    <CheckCircle2 className="size-14 animate-in text-green-600 duration-700 spin-in-45 zoom-in" />
                    <h1 className="text-2xl font-extrabold tracking-tight uppercase">
                        Order Placed
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Thanks, {order.customer_name.split(' ')[0]}. We&apos;ll
                        call {order.phone_number} to confirm your order shortly.
                    </p>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Order #{order.order_number}
                    </p>
                    <p className="text-xs font-semibold text-store-alert uppercase">
                        Estimated delivery: {order.estimated_delivery} to{' '}
                        {order.city}
                    </p>
                    {order.guest_id && (
                        <p className="mt-1 rounded-sm bg-store-cream/60 px-3 py-2 text-xs text-muted-foreground">
                            Your Guest ID is{' '}
                            <span className="font-semibold text-store-ink">
                                {order.guest_id}
                            </span>{' '}
                            — this browser will remember it so you can view this
                            order under Order History later.
                        </p>
                    )}
                </div>

                <div className="mt-10 border border-store-gray">
                    <div className="border-b border-store-gray px-5 py-3">
                        <h2 className="text-xs font-semibold tracking-wide uppercase">
                            Items
                        </h2>
                    </div>
                    <ul className="divide-y divide-store-gray px-5">
                        {order.items.map((item, index) => (
                            <li
                                key={index}
                                className="flex justify-between gap-2 py-3 text-sm"
                            >
                                <span className="text-muted-foreground">
                                    {item.product_name}{' '}
                                    <span className="text-xs">
                                        (EU {item.size} × {item.quantity})
                                    </span>
                                </span>
                                <span className="font-medium">
                                    {formatBdt(item.unit_price * item.quantity)}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-col gap-1 border-t border-store-gray px-5 py-4 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{formatBdt(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Delivery ({order.zone})</span>
                            <span>{formatBdt(order.delivery_fee)}</span>
                        </div>
                        <div className="flex justify-between border-t border-store-gray pt-1 text-base font-bold">
                            <span>Total</span>
                            <span>{formatBdt(order.total_amount)}</span>
                        </div>
                    </div>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <dt className="text-xs text-muted-foreground uppercase">
                            Payment Method
                        </dt>
                        <dd className="mt-0.5 font-medium">
                            {order.payment_method}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-muted-foreground uppercase">
                            Status
                        </dt>
                        <dd className="mt-0.5 font-medium">{order.status}</dd>
                    </div>
                    {order.payment_transaction_id && (
                        <div>
                            <dt className="text-xs text-muted-foreground uppercase">
                                Transaction ID
                            </dt>
                            <dd className="mt-0.5 font-medium">
                                {order.payment_transaction_id}
                            </dd>
                        </div>
                    )}
                    <div className="col-span-2">
                        <dt className="text-xs text-muted-foreground uppercase">
                            Shipping Address
                        </dt>
                        <dd className="mt-0.5 font-medium">
                            {order.shipping_address}, {order.city}
                        </dd>
                    </div>
                    <div className="col-span-2">
                        <dt className="text-xs text-muted-foreground uppercase">
                            Placed On
                        </dt>
                        <dd className="mt-0.5 font-medium">
                            {order.created_at}
                        </dd>
                    </div>
                </dl>

                <div className="mt-8 flex flex-col gap-2">
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="w-full rounded-sm border-store-ink bg-white text-store-ink hover:bg-store-ink/5 hover:text-store-ink"
                    >
                        <a href={invoice(order.order_number).url}>
                            <Download className="size-4" />
                            Download Invoice (PDF)
                        </a>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        className="w-full rounded-sm bg-store-ink text-store-bone hover:bg-store-ink/90"
                    >
                        <Link href={home()}>Continue Shopping</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
