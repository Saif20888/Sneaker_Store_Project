import { Head, Link } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import ProductCard from '@/components/product-card';
import type { ProductCardData } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { index as shopIndex } from '@/routes/products';

type WishlistProps = {
    products: ProductCardData[];
};

export default function Wishlist({ products }: WishlistProps) {
    return (
        <>
            <Head title="Your Wish List" />

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-extrabold tracking-tight uppercase">
                    Wish List
                </h1>

                {products.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-20 text-center">
                        <Heart className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Nothing saved yet. Tap the heart on any sneaker to
                            add it here.
                        </p>
                        <Button asChild className="mt-2 rounded-sm">
                            <Link href={shopIndex()}>Shop All Sneakers</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={product.slug} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
