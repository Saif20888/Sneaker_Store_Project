import PriceTag from '@/components/price-tag';
import { Button } from '@/components/ui/button';

type MobileAddToBagBarProps = {
    originalPrice: number;
    discountPrice: number | null;
    selected: boolean;
    disabled: boolean;
    onAddToBag: () => void;
    onBuyNow: () => void;
};

export default function MobileAddToBagBar({
    originalPrice,
    discountPrice,
    selected,
    disabled,
    onAddToBag,
    onBuyNow,
}: MobileAddToBagBarProps) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-2 border-t border-store-gray bg-store-bone/95 px-4 py-3 [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
            <div className="flex items-center gap-3">
                <PriceTag
                    originalPrice={originalPrice}
                    discountPrice={discountPrice}
                    className="shrink-0 text-base"
                />
                <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 rounded-sm border-store-ink bg-white text-store-ink hover:bg-store-ink/5 hover:text-store-ink"
                    disabled={disabled}
                    onClick={onAddToBag}
                >
                    {selected ? 'Add to Bag' : 'Select a Size'}
                </Button>
            </div>
            <Button
                size="lg"
                className="rounded-sm bg-store-ink text-store-bone hover:bg-store-ink/90"
                disabled={disabled}
                onClick={onBuyNow}
            >
                Buy Now
            </Button>
        </div>
    );
}
