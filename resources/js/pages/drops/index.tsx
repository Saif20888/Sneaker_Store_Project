import { Head } from '@inertiajs/react';
import ProductCard from '@/components/product-card';
import type { ProductCardData } from '@/components/product-card';

type DropsProps = {
    products: ProductCardData[];
};

export default function DropsIndex({ products }: DropsProps) {
    return (
        <>
            <Head title="New Arrivals" />

            <section className="border-b border-store-gray bg-store-cream/40">
                <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
                    <span className="text-xs font-semibold tracking-[0.3em] text-store-alert uppercase">
                        Just Landed
                    </span>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-store-ink uppercase sm:text-4xl">
                        New Arrivals
                    </h1>
                    <p className="mt-3 text-sm text-muted-foreground">
                        The newest sneakers to hit Vint-Edge, freshly added to
                        the catalog.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                {products.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No new arrivals yet — check back soon.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={product.slug} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
