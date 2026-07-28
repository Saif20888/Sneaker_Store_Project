import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type CatalogVariant = {
    id: number;
    size: string;
    stock_quantity: number;
};
export type CatalogProduct = {
    id: number;
    name: string;
    brand: string;
    current_price: number;
    variants: CatalogVariant[];
};

export type EditableRow = {
    key: string;
    product_id: number | '';
    product_variant_id: number | '';
    quantity: number;
};

export function findProductForVariant(
    catalog: CatalogProduct[],
    variantId: number,
): CatalogProduct | undefined {
    return catalog.find((product) =>
        product.variants.some((variant) => variant.id === variantId),
    );
}

export function emptyOrderItemRow(seed: number): EditableRow {
    return {
        key: `new-${seed}`,
        product_id: '',
        product_variant_id: '',
        quantity: 1,
    };
}

type OrderItemRowsProps = {
    catalog: CatalogProduct[];
    rows: EditableRow[];
    disabled?: boolean;
    onUpdateRow: (key: string, patch: Partial<EditableRow>) => void;
    onAddRow: () => void;
    onRemoveRow: (key: string) => void;
    error?: string;
};

export default function OrderItemRows({
    catalog,
    rows,
    disabled = false,
    onUpdateRow,
    onAddRow,
    onRemoveRow,
    error,
}: OrderItemRowsProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3">
                {rows.map((row) => {
                    const product = catalog.find(
                        (p) => p.id === row.product_id,
                    );

                    return (
                        <div
                            key={row.key}
                            className="grid grid-cols-1 items-center gap-2 rounded-md border p-3 sm:grid-cols-[2fr_1fr_5rem_auto]"
                        >
                            <select
                                value={row.product_id}
                                disabled={disabled}
                                onChange={(e) =>
                                    onUpdateRow(row.key, {
                                        product_id: e.target.value
                                            ? Number(e.target.value)
                                            : '',
                                        product_variant_id: '',
                                    })
                                }
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                            >
                                <option value="">Select a product</option>
                                {catalog.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.brand} — {p.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={row.product_variant_id}
                                disabled={disabled || !product}
                                onChange={(e) =>
                                    onUpdateRow(row.key, {
                                        product_variant_id: e.target.value
                                            ? Number(e.target.value)
                                            : '',
                                    })
                                }
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                            >
                                <option value="">Select size</option>
                                {product?.variants.map((variant) => (
                                    <option
                                        key={variant.id}
                                        value={variant.id}
                                        disabled={
                                            variant.stock_quantity <= 0 &&
                                            variant.id !==
                                                row.product_variant_id
                                        }
                                    >
                                        EU {variant.size} (
                                        {variant.stock_quantity} in stock)
                                    </option>
                                ))}
                            </select>

                            <Input
                                type="number"
                                min={1}
                                value={row.quantity}
                                disabled={disabled}
                                onChange={(e) =>
                                    onUpdateRow(row.key, {
                                        quantity: Math.max(
                                            1,
                                            Number(e.target.value) || 1,
                                        ),
                                    })
                                }
                            />

                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={disabled}
                                onClick={() => onRemoveRow(row.key)}
                                aria-label="Remove item"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    );
                })}
            </div>

            {!disabled && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onAddRow}
                    className="w-fit"
                >
                    <Plus className="size-4" />
                    Add Item
                </Button>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
