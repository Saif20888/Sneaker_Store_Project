import PriceTag from '@/components/price-tag';
import { Button } from '@/components/ui/button';

type MobileAddToBagBarProps = {
    originalPrice: number;
    discountPrice: number | null;
    selected: boolean;
    disabled: boolean;
    onAddToBag: () => void;
};

export default function MobileAddToBagBar({
    originalPrice,
    discountPrice,
    selected,
    disabled,
    onAddToBag,
}: MobileAddToBagBarProps) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-store-gray bg-store-bone/95 px-4 py-3 [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
            <PriceTag
                originalPrice={originalPrice}
                discountPrice={discountPrice}
                className="shrink-0 text-base"
            />
            <Button
                size="lg"
                className="flex-1 rounded-sm bg-store-ink text-store-bone hover:bg-store-ink/90"
                disabled={disabled}
                onClick={onAddToBag}
            >
                {selected ? 'Add to Bag' : 'Select a Size'}
            </Button>
        </div>
    );
}
