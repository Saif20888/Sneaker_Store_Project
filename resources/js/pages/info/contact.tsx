import { Head } from '@inertiajs/react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

type ContactProps = {
    whatsapp: string;
    phone: string;
    email: string;
    address: string;
};

export default function Contact({
    whatsapp,
    phone,
    email,
    address,
}: ContactProps) {
    return (
        <>
            <Head title="Contact Us" />

            <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-extrabold tracking-tight uppercase sm:text-3xl">
                    Contact Us
                </h1>
                <p className="mt-4 text-sm text-muted-foreground">
                    Have a question about an order, sizing, or a specific pair
                    you&apos;re hunting for? Reach out — we&apos;re happy to
                    help.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <a
                        href={`https://wa.me/${whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-sm border border-store-gray p-4 transition-colors hover:border-store-ink"
                    >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                            <MessageCircle className="size-5" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold tracking-wide uppercase">
                                WhatsApp
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {phone}
                            </p>
                        </div>
                    </a>

                    <a
                        href={`tel:${phone.replace(/\s+/g, '')}`}
                        className="flex items-center gap-3 rounded-sm border border-store-gray p-4 transition-colors hover:border-store-ink"
                    >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-store-alert/10 text-store-alert">
                            <Phone className="size-5" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold tracking-wide uppercase">
                                Phone
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {phone}
                            </p>
                        </div>
                    </a>

                    <a
                        href={`mailto:${email}`}
                        className="flex items-center gap-3 rounded-sm border border-store-gray p-4 transition-colors hover:border-store-ink"
                    >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-store-alert/10 text-store-alert">
                            <Mail className="size-5" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold tracking-wide uppercase">
                                Email &amp; Support Ticket
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {email}
                            </p>
                        </div>
                    </a>

                    <div className="flex items-center gap-3 rounded-sm border border-store-gray p-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-store-alert/10 text-store-alert">
                            <MapPin className="size-5" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold tracking-wide uppercase">
                                Address
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {address}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
