import { Link } from '@inertiajs/react';
import { Eye, Heart } from 'lucide-react';
import { useState } from 'react';
import PriceTag from '@/components/price-tag';
import ProductQuickViewModal from '@/components/product-quick-view-modal';
import { useWishlist } from '@/hooks/use-wishlist';
import { show } from '@/routes/products';

export type ProductCardData = {
    id: number;
    slug: string;
    name: string;
    brand: string;
    original_price: number;
    discount_price: number | null;
    discount_percentage: number | null;
    images: string[] | null;
    is_in_stock?: boolean;
    is_limited?: boolean;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { isWishlisted, toggle } = useWishlist();
    const image = product.images?.[0];
    const isOutOfStock = product.is_in_stock === false;
    const isDiscounted = product.discount_price !== null;
    const wishlisted = isWishlisted(product.id);

    return (
        <div className="group flex flex-col rounded-sm border border-transparent p-2 transition-all duration-300 hover:-translate-y-1 hover:border-store-ink/15 hover:shadow-lg hover:shadow-black/10">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-sm bg-store-cream/60">
                <Link href={show(product.slug)} className="contents">
                    {image ? (
                        <>
                            {!imageLoaded && (
                                <span className="absolute inset-0 animate-pulse bg-store-gray/50" />
                            )}
                            <img
                                ref={(el) => {
                                    if (el?.complete) {
                                        setImageLoaded(true);
                                    }
                                }}
                                src={image}
                                alt={product.name}
                                loading="lazy"
                                decoding="async"
                                onLoad={() => setImageLoaded(true)}
                                className={`size-full object-cover transition-[transform,opacity] duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            />
                        </>
                    ) : (
                        <span className="px-4 text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            {product.name}
                        </span>
                    )}
                </Link>

                {isOutOfStock ? (
                    <span className="absolute top-2 left-2 rounded-sm bg-store-ink px-2 py-1 text-[10px] font-bold tracking-wide text-store-bone uppercase">
                        Sold Out
                    </span>
                ) : isDiscounted ? (
                    <span className="absolute top-2 left-2 rounded-sm bg-store-alert px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase shadow-sm">
                        {Math.round(product.discount_percentage ?? 0)}% Off
                    </span>
                ) : (
                    product.is_limited && (
                        <span className="absolute top-2 left-2 flex items-center gap-1 rounded-sm bg-store-alert px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase shadow-sm">
                            <span className="size-1.5 animate-pulse rounded-full bg-white" />
                            Limited Stock
                        </span>
                    )
                )}

                <button
                    type="button"
                    onClick={() => toggle(product.id)}
                    aria-label={
                        wishlisted
                            ? `Remove ${product.name} from wishlist`
                            : `Add ${product.name} to wishlist`
                    }
                    aria-pressed={wishlisted}
                    className={`absolute top-2 right-2 flex size-9 items-center justify-center rounded-full bg-store-bone shadow-md transition-colors hover:bg-store-ink hover:text-store-bone ${
                        wishlisted ? 'text-store-alert' : 'text-store-ink'
                    }`}
                >
                    <Heart
                        className="size-4"
                        fill={wishlisted ? 'currentColor' : 'none'}
                    />
                </button>

                {!isOutOfStock && (
                    <button
                        type="button"
                        onClick={() => setQuickViewOpen(true)}
                        aria-label={`Quick view ${product.name}`}
                        className="absolute right-2 bottom-2 flex size-9 translate-y-1 items-center justify-center rounded-full bg-store-bone text-store-ink opacity-0 shadow-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-store-ink hover:text-store-bone focus-visible:translate-y-0 focus-visible:opacity-100"
                    >
                        <Eye className="size-4" />
                    </button>
                )}
            </div>

            <Link
                href={show(product.slug)}
                className="mt-3 flex flex-col gap-0.5"
            >
                <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    {product.brand}
                </span>
                <span className="text-sm leading-snug font-medium text-store-ink">
                    {product.name}
                </span>
                <PriceTag
                    originalPrice={product.original_price}
                    discountPrice={product.discount_price}
                    className="mt-0.5 text-sm"
                />
            </Link>

            <ProductQuickViewModal
                slug={product.slug}
                open={quickViewOpen}
                onOpenChange={setQuickViewOpen}
            />
        </div>
    );
}
