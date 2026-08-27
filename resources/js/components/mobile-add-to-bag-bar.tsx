import PriceTag from '@/components/price-tag';
import { Button } from '@/components/ui/button';

type MobileAddToBagBarProps = {
    originalPrice: number;
    discountPrice: number | null;
    selected: boolean;
    disabled: boolean;
    onAddToBag: () => void;
    onBuyNow: () => void;
    onSelectSize: () => void;
};

export default function MobileAddToBagBar({
    originalPrice,
    discountPrice,
    selected,
    disabled,
    onAddToBag,
    onBuyNow,
    onSelectSize,
}: MobileAddToBagBarProps) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-2 border-t border-store-gray bg-store-bone/95 px-4 py-3 [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
            <PriceTag
                originalPrice={originalPrice}
                discountPrice={discountPrice}
                className="text-base"
            />
            {selected ? (
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        size="lg"
                        className="rounded-sm bg-store-ink text-store-bone hover:bg-store-ink/90"
                        disabled={disabled}
                        onClick={onAddToBag}
                    >
                        Add to Bag
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="rounded-sm border-store-ink bg-white text-store-ink hover:bg-store-ink/5 hover:text-store-ink"
                        disabled={disabled}
                        onClick={onBuyNow}
                    >
                        Buy Now
                    </Button>
                </div>
            ) : (
                <Button
                    size="lg"
                    className="w-full rounded-sm bg-store-ink text-store-bone hover:bg-store-ink/90"
                    onClick={onSelectSize}
                >
                    Select a Size
                </Button>
            )}
        </div>
    );
}
