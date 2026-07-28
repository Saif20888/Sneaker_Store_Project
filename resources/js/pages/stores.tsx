import { Head } from '@inertiajs/react';
import { Clock, MapPin, Phone } from 'lucide-react';

type Location = {
    name: string;
    address: string;
    phone: string;
    hours: string;
};

type StoresProps = {
    locations: Location[];
};

export default function Stores({ locations }: StoresProps) {
    return (
        <>
            <Head title="About Us & Contact" />

            <section className="border-b border-store-gray bg-store-cream/40">
                <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
                    <span className="text-xs font-semibold tracking-[0.3em] text-store-alert uppercase">
                        Our Story
                    </span>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-store-ink uppercase sm:text-4xl">
                        Built for the Bangladesh Streets
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
                        Vint-Edge started with a simple idea — bring premium
                        sneaker culture to Bangladesh at prices that actually
                        make sense. We source classic and hyped silhouettes, run
                        real discounts instead of inflated markups, and ship
                        nationwide with Cash on Delivery so you can cop with
                        confidence.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
                <h2 className="mb-8 text-center text-2xl font-extrabold tracking-tight uppercase">
                    Get in Touch
                </h2>
                <div className="flex flex-col gap-6">
                    {locations.map((location) => (
                        <div
                            key={location.name}
                            className="flex flex-col gap-3 border border-store-gray p-6"
                        >
                            <h3 className="text-sm font-bold uppercase">
                                {location.name}
                            </h3>
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MapPin className="mt-0.5 size-4 shrink-0" />
                                <span>{location.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="size-4 shrink-0" />
                                <span>{location.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="size-4 shrink-0" />
                                <span>{location.hours}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
