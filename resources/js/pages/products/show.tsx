import { Head } from '@inertiajs/react';
import { MessageCircle, Minus, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import ImageMagnifier from '@/components/image-magnifier';
import MobileAddToBagBar from '@/components/mobile-add-to-bag-bar';
import PriceTag from '@/components/price-tag';
import ProductCard from '@/components/product-card';
import type { ProductCardData } from '@/components/product-card';
import SizeGuideModal from '@/components/size-guide-modal';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useCart } from '@/hooks/use-cart';

const WHATSAPP_NUMBER = '8801601638822';

type Variant = {
    id: number;
    size: string;
    stock_quantity: number;
};

type ProductProps = {
    product: {
        id: number;
        slug: string;
        name: string;
        description: string | null;
        original_price: number;
        discount_price: number | null;
        discount_percentage: number | null;
        images: string[] | null;
        brand: string;
        category: string;
        release_date: string | null;
        variants: Variant[];
    };
    related: ProductCardData[];
};

function Thumbnail({ src }: { src: string }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <span className="relative block size-full bg-store-cream/60">
            {!loaded && (
                <span className="absolute inset-0 animate-pulse bg-store-gray/60" />
            )}
            <img
                src={src}
                alt=""
                onLoad={() => setLoaded(true)}
                className={`size-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </span>
    );
}

const ACCORDIONS = (description: string | null) => [
    {
        title: 'Product Description',
        content:
            description ?? 'No description available for this product yet.',
    },
    {
        title: 'Material & Care',
        content:
            'Upper materials vary by silhouette (leather, suede, mesh, or knit) — wipe clean with a soft, dry cloth and avoid prolonged exposure to direct sunlight or moisture. Use a shoe tree to help maintain shape between wears.',
    },
    {
        title: 'Shipping & Returns (Bangladesh)',
        content:
            'Cash on Delivery available nationwide. Inside Dhaka: 1-2 business days. Outside Dhaka: 3-4 business days. Unworn items in original packaging can be exchanged within 3 days of delivery — contact us via WhatsApp to arrange.',
    },
];

export default function ProductShow({ product, related }: ProductProps) {
    const { addItem, openCart } = useCart();
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [openAccordion, setOpenAccordion] = useState<string | null>(
        'Product Description',
    );

    const selectedVariant = useMemo(
        () =>
            product.variants.find((variant) => variant.size === selectedSize) ??
            null,
        [product.variants, selectedSize],
    );

    const images = product.images ?? [];
    const maxQuantity = Math.min(selectedVariant?.stock_quantity ?? 5, 5);

    const handleAddToBag = () => {
        if (!selectedVariant || selectedVariant.stock_quantity <= 0) {
            return;
        }

        addItem(selectedVariant.id, quantity);
        openCart();
    };

    const whatsappHref = (() => {
        const sizeText = selectedVariant
            ? `EU ${selectedVariant.size}`
            : 'EU [your size]';
        const message = `Hi Vint-Edge, I want to order ${product.name} in Size ${sizeText}`;

        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    })();

    return (
        <>
            <Head title={product.name} />

            <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-0">
                <div className="grid gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-16">
                    {/* Gallery */}
                    <div className="flex flex-col gap-3">
                        {images[activeImage] ? (
                            <ImageMagnifier
                                src={images[activeImage]}
                                alt={product.name}
                            />
                        ) : (
                            <div className="flex aspect-square items-center justify-center bg-store-gray/60">
                                <span className="px-8 text-center text-sm font-medium tracking-wide text-muted-foreground uppercase">
                                    {product.name}
                                </span>
                            </div>
                        )}
                        {images.length > 1 && (
                            <div className="flex gap-2">
                                {images.map((image, index) => (
                                    <button
                                        key={image}
                                        type="button"
                                        onClick={() => setActiveImage(index)}
                                        className={`size-16 shrink-0 overflow-hidden border ${
                                            activeImage === index
                                                ? 'border-store-ink'
                                                : 'border-store-gray'
                                        }`}
                                    >
                                        <Thumbnail src={image} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                                {product.brand}
                            </p>
                            <h1 className="mt-1 text-2xl font-extrabold tracking-tight uppercase sm:text-3xl">
                                {product.name}
                            </h1>
                            <PriceTag
                                originalPrice={product.original_price}
                                discountPrice={product.discount_price}
                                className="mt-3 text-xl"
                            />
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-semibold tracking-wide uppercase">
                                    Select Size (EU)
                                </span>
                                <SizeGuideModal
                                    trigger={
                                        <button
                                            type="button"
                                            className="text-xs font-medium text-muted-foreground underline underline-offset-2"
                                        >
                                            Size Guide
                                        </button>
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                                {product.variants.map((variant) => {
                                    const isOutOfStock =
                                        variant.stock_quantity <= 0;
                                    const isSelected =
                                        selectedSize === variant.size;

                                    return (
                                        <button
                                            key={variant.id}
                                            type="button"
                                            disabled={isOutOfStock}
                                            onClick={() => {
                                                setSelectedSize(variant.size);
                                                setQuantity(1);
                                            }}
                                            className={`relative rounded-sm border py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                                                isSelected
                                                    ? 'border-store-ink bg-store-ink text-store-bone'
                                                    : 'border-store-gray hover:border-store-ink'
                                            }`}
                                        >
                                            {variant.size}
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedVariant &&
                                selectedVariant.stock_quantity > 0 &&
                                selectedVariant.stock_quantity <= 3 && (
                                    <p className="mt-2 text-xs font-semibold text-store-alert">
                                        Only {selectedVariant.stock_quantity}{' '}
                                        pair(s) left in EU{' '}
                                        {selectedVariant.size}!
                                    </p>
                                )}
                            {selectedVariant &&
                                selectedVariant.stock_quantity <= 0 && (
                                    <p className="mt-2 text-xs font-semibold text-muted-foreground">
                                        This size is sold out.
                                    </p>
                                )}
                        </div>

                        {selectedVariant &&
                            selectedVariant.stock_quantity > 0 && (
                                <div>
                                    <span className="mb-2 block text-xs font-semibold tracking-wide uppercase">
                                        Quantity
                                    </span>
                                    <div className="flex w-fit items-center border border-store-gray">
                                        <button
                                            type="button"
                                            className="flex size-9 items-center justify-center disabled:opacity-30"
                                            onClick={() =>
                                                setQuantity((q) =>
                                                    Math.max(1, q - 1),
                                                )
                                            }
                                            disabled={quantity <= 1}
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="size-3.5" />
                                        </button>
                                        <span className="w-10 text-center text-sm font-medium">
                                            {quantity}
                                        </span>
                                        <button
                                            type="button"
                                            className="flex size-9 items-center justify-center disabled:opacity-30"
                                            onClick={() =>
                                                setQuantity((q) =>
                                                    Math.min(
                                                        maxQuantity,
                                                        q + 1,
                                                    ),
                                                )
                                            }
                                            disabled={quantity >= maxQuantity}
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                        <div className="flex flex-col gap-2">
                            <Button
                                size="lg"
                                className="hidden rounded-sm bg-store-ink text-store-bone hover:bg-store-ink/90 lg:inline-flex"
                                disabled={
                                    !selectedVariant ||
                                    selectedVariant.stock_quantity <= 0
                                }
                                onClick={handleAddToBag}
                            >
                                {selectedVariant
                                    ? 'Add to Bag'
                                    : 'Select a Size'}
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="rounded-sm border-store-ink bg-white text-store-ink hover:bg-store-ink/5 hover:text-store-ink"
                            >
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MessageCircle className="size-4" />
                                    Order via WhatsApp
                                </a>
                            </Button>
                        </div>

                        <div className="flex flex-col divide-y divide-store-gray border-y border-store-gray">
                            {ACCORDIONS(product.description).map((section) => (
                                <Collapsible
                                    key={section.title}
                                    open={openAccordion === section.title}
                                    onOpenChange={(open) =>
                                        setOpenAccordion(
                                            open ? section.title : null,
                                        )
                                    }
                                >
                                    <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left text-xs font-semibold tracking-wide uppercase">
                                        {section.title}
                                        <span className="text-muted-foreground">
                                            {openAccordion === section.title
                                                ? '−'
                                                : '+'}
                                        </span>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                                        {section.content}
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                        </div>

                        <dl className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-xs text-muted-foreground uppercase">
                                    Category
                                </dt>
                                <dd className="mt-0.5 font-medium">
                                    {product.category}
                                </dd>
                            </div>
                            {product.release_date && (
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">
                                        Release Date
                                    </dt>
                                    <dd className="mt-0.5 font-medium">
                                        {product.release_date}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                {related.length > 0 && (
                    <section className="border-t border-store-gray py-16">
                        <h2 className="mb-8 text-xl font-extrabold tracking-tight uppercase">
                            You May Also Like
                        </h2>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
                            {related.map((item) => (
                                <ProductCard key={item.slug} product={item} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <MobileAddToBagBar
                originalPrice={product.original_price}
                discountPrice={product.discount_price}
                selected={!!selectedVariant}
                disabled={
                    !selectedVariant || selectedVariant.stock_quantity <= 0
                }
                onAddToBag={handleAddToBag}
            />
        </>
    );
}
