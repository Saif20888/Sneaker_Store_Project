import { formatBdt } from '@/lib/currency';

type PriceTagProps = {
    originalPrice: number;
    discountPrice: number | null;
    className?: string;
};

export default function PriceTag({
    originalPrice,
    discountPrice,
    className,
}: PriceTagProps) {
    if (discountPrice !== null) {
        return (
            <span className={`flex items-center gap-2 ${className ?? ''}`}>
                <span className="font-bold">{formatBdt(discountPrice)}</span>
                <span className="text-muted-foreground line-through">
                    {formatBdt(originalPrice)}
                </span>
            </span>
        );
    }

    return (
        <span className={`font-bold ${className ?? ''}`}>
            {formatBdt(originalPrice)}
        </span>
    );
}
