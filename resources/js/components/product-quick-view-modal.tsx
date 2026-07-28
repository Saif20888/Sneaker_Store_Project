import { Minus, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PriceTag from '@/components/price-tag';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useCart } from '@/hooks/use-cart';
import { quickView } from '@/routes/products';

type Variant = {
    id: number;
    size: string;
    stock_quantity: number;
};

type QuickViewProduct = {
    id: number;
    slug: string;
    name: string;
    brand: string;
    original_price: number;
    discount_price: number | null;
    images: string[] | null;
    variants: Variant[];
};

type ProductQuickViewModalProps = {
    slug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function ProductQuickViewModal({
    slug,
    open,
    onOpenChange,
}: ProductQuickViewModalProps) {
    const { addItem, openCart } = useCart();
    const [product, setProduct] = useState<QuickViewProduct | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!open || product) {
            return;
        }

        fetch(quickView(slug).url, { headers: { Accept: 'application/json' } })
            .then((response) => response.json())
            .then((data: QuickViewProduct) => {
                setProduct(data);
                setSelectedSize(null);
                setQuantity(1);
            });
    }, [open, slug, product]);

    const selectedVariant = useMemo(
        () =>
            product?.variants.find(
                (variant) => variant.size === selectedSize,
            ) ?? null,
        [product, selectedSize],
    );

    const maxQuantity = Math.min(selectedVariant?.stock_quantity ?? 5, 5);

    const handleAddToBag = () => {
        if (!selectedVariant || selectedVariant.stock_quantity <= 0) {
            return;
        }

        addItem(selectedVariant.id, quantity);
        onOpenChange(false);
        openCart();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-sm sm:max-w-lg">
                {!product ? (
                    <div className="flex items-center justify-center py-16">
                        <Spinner className="size-6" />
                    </div>
                ) : (
                    <>
                        <DialogTitle className="sr-only">
                            {product.name}
                        </DialogTitle>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="flex aspect-square items-center justify-center bg-store-gray/60">
                                {product.images?.[0] ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <span className="px-4 text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        {product.name}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                                        {product.brand}
                                    </p>
                                    <h2 className="mt-1 text-lg font-extrabold tracking-tight uppercase">
                                        {product.name}
                                    </h2>
                                    <PriceTag
                                        originalPrice={product.original_price}
                                        discountPrice={product.discount_price}
                                        className="mt-2 text-lg"
                                    />
                                </div>

                                <div>
                                    <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase">
                                        Size (EU)
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {product.variants.map((variant) => {
                                            const isOutOfStock =
                                                variant.stock_quantity <= 0;

                                            return (
                                                <button
                                                    key={variant.id}
                                                    type="button"
                                                    disabled={isOutOfStock}
                                                    onClick={() => {
                                                        setSelectedSize(
                                                            variant.size,
                                                        );
                                                        setQuantity(1);
                                                    }}
                                                    className={`rounded-sm border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-30 ${
                                                        selectedSize ===
                                                        variant.size
                                                            ? 'border-store-ink bg-store-ink text-store-bone'
                                                            : 'border-store-gray hover:border-store-ink'
                                                    }`}
                                                >
                                                    {variant.size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {selectedVariant &&
                                    selectedVariant.stock_quantity > 0 && (
                                        <div>
                                            <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase">
                                                Quantity
                                            </span>
                                            <div className="flex w-fit items-center border border-store-gray">
                                                <button
                                                    type="button"
                                                    className="flex size-8 items-center justify-center disabled:opacity-30"
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
                                                <span className="w-9 text-center text-sm font-medium">
                                                    {quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="flex size-8 items-center justify-center disabled:opacity-30"
                                                    onClick={() =>
                                                        setQuantity((q) =>
                                                            Math.min(
                                                                maxQuantity,
                                                                q + 1,
                                                            ),
                                                        )
                                                    }
                                                    disabled={
                                                        quantity >= maxQuantity
                                                    }
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                <Button
                                    size="lg"
                                    className="rounded-sm bg-store-ink text-store-bone hover:bg-store-ink/90"
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
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
