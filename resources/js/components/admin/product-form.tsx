import { useForm } from '@inertiajs/react';
import { ImagePlus, Plus, Star, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { DEFAULT_SIZE_CHART } from '@/components/size-guide-modal';
import type { SizeChartRow } from '@/components/size-guide-modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Option = { id: number; name: string };

type VariantRow = {
    id?: number;
    size: string;
    stock_quantity: number;
};

type ProductFormValues = {
    name: string;
    slug: string;
    category_id: string;
    brand_id: string;
    description: string;
    original_price: string;
    purchase_price: string;
    discount_price: string;
    discount_percentage: string;
    is_featured: boolean;
    release_date: string;
    images: File[];
    existing_images: string[];
    image_order: string[];
    size_chart: SizeChartRow[];
    variants: VariantRow[];
};

type GalleryItem =
    | { id: string; kind: 'existing'; url: string }
    | { id: string; kind: 'new'; file: File };

type ProductFormProps = {
    categories: Option[];
    brands: Option[];
    submitUrl: string;
    submitMethod: 'post' | 'patch';
    submitLabel: string;
    initialValues?: Partial<ProductFormValues>;
};

function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function ProductForm({
    categories,
    brands,
    submitUrl,
    submitMethod,
    submitLabel,
    initialValues,
}: ProductFormProps) {
    const [slugTouched, setSlugTouched] = useState(
        Boolean(initialValues?.slug),
    );

    const initialExistingImages = initialValues?.existing_images ?? [];
    const nextGalleryId = useRef(0);

    const [gallery, setGallery] = useState<GalleryItem[]>(() =>
        initialExistingImages.map((url) => ({
            id: url,
            kind: 'existing',
            url,
        })),
    );

    const { data, setData, post, transform, processing, errors } =
        useForm<ProductFormValues>({
            name: '',
            slug: '',
            category_id: '',
            brand_id: '',
            description: '',
            original_price: '',
            purchase_price: '',
            discount_price: '',
            discount_percentage: '',
            is_featured: false,
            release_date: '',
            images: [],
            existing_images: initialExistingImages,
            image_order: initialExistingImages.map(() => 'existing'),
            size_chart: DEFAULT_SIZE_CHART.map((row) => ({ ...row })),
            variants: [{ size: '', stock_quantity: 0 }],
            ...initialValues,
        });

    const applyGallery = (next: GalleryItem[]) => {
        setGallery(next);
        setData('existing_images', [
            ...next
                .filter((item) => item.kind === 'existing')
                .map((item) => item.url),
        ]);
        setData('images', [
            ...next
                .filter((item) => item.kind === 'new')
                .map((item) => item.file),
        ]);
        setData(
            'image_order',
            next.map((item) => item.kind),
        );
    };

    const addImages = (files: File[]) => {
        const newItems: GalleryItem[] = files.map((file) => ({
            id: `new-${nextGalleryId.current++}`,
            kind: 'new',
            file,
        }));

        applyGallery([...gallery, ...newItems]);
    };

    const removeGalleryImage = (id: string) => {
        applyGallery(gallery.filter((item) => item.id !== id));
    };

    const makeGalleryImageMain = (id: string) => {
        const item = gallery.find((image) => image.id === id);

        if (!item) {
            return;
        }

        applyGallery([item, ...gallery.filter((image) => image.id !== id)]);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (submitMethod === 'patch') {
            transform((formData) => ({
                ...formData,
                _method: 'patch',
            }));
        }

        post(submitUrl, { forceFormData: true });
    };

    const updateVariant = (
        index: number,
        field: keyof VariantRow,
        value: string | number,
    ) => {
        setData(
            'variants',
            data.variants.map((variant, i) =>
                i === index ? { ...variant, [field]: value } : variant,
            ),
        );
    };

    const addVariant = () => {
        setData('variants', [
            ...data.variants,
            { size: '', stock_quantity: 0 },
        ]);
    };

    const removeVariant = (index: number) => {
        setData(
            'variants',
            data.variants.filter((_, i) => i !== index),
        );
    };

    const updateSizeChartRow = (
        index: number,
        field: keyof SizeChartRow,
        value: string,
    ) => {
        setData(
            'size_chart',
            data.size_chart.map((row, i) =>
                i === index ? { ...row, [field]: value } : row,
            ),
        );
    };

    const addSizeChartRow = () => {
        setData('size_chart', [
            ...data.size_chart,
            { size: '', us: '', uk: '', cm: '' },
        ]);
    };

    const removeSizeChartRow = (index: number) => {
        setData(
            'size_chart',
            data.size_chart.filter((_, i) => i !== index),
        );
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => {
                            setData('name', e.target.value);

                            if (!slugTouched) {
                                setData('slug', slugify(e.target.value));
                            }
                        }}
                        required
                    />
                    {errors.name && (
                        <p className="text-xs text-destructive">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                        id="slug"
                        value={data.slug}
                        onChange={(e) => {
                            setSlugTouched(true);
                            setData('slug', e.target.value);
                        }}
                        required
                    />
                    {errors.slug && (
                        <p className="text-xs text-destructive">
                            {errors.slug}
                        </p>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="category_id">Category</Label>
                    <select
                        id="category_id"
                        value={data.category_id}
                        onChange={(e) => setData('category_id', e.target.value)}
                        required
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                    >
                        <option value="" disabled>
                            Select a category
                        </option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {errors.category_id && (
                        <p className="text-xs text-destructive">
                            {errors.category_id}
                        </p>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="brand_id">Brand</Label>
                    <select
                        id="brand_id"
                        value={data.brand_id}
                        onChange={(e) => setData('brand_id', e.target.value)}
                        required
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                    >
                        <option value="" disabled>
                            Select a brand
                        </option>
                        {brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                                {brand.name}
                            </option>
                        ))}
                    </select>
                    {errors.brand_id && (
                        <p className="text-xs text-destructive">
                            {errors.brand_id}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                    id="description"
                    rows={4}
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
                {errors.description && (
                    <p className="text-xs text-destructive">
                        {errors.description}
                    </p>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="grid gap-2">
                    <Label htmlFor="original_price">Selling Price (BDT)</Label>
                    <Input
                        id="original_price"
                        type="number"
                        min={0}
                        value={data.original_price}
                        onChange={(e) => {
                            const nextOriginal = e.target.value;
                            setData('original_price', nextOriginal);

                            // Keep the discount price in sync with the selling price
                            // whenever a discount percentage is already set.
                            const pct = Number(data.discount_percentage);
                            const original = Number(nextOriginal);

                            if (data.discount_percentage !== '' && original > 0) {
                                setData(
                                    'discount_price',
                                    String(
                                        Math.round(
                                            original * (1 - pct / 100),
                                        ),
                                    ),
                                );
                            }
                        }}
                        required
                    />
                    {errors.original_price && (
                        <p className="text-xs text-destructive">
                            {errors.original_price}
                        </p>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="purchase_price">Purchase Price (BDT)</Label>
                    <Input
                        id="purchase_price"
                        type="number"
                        min={0}
                        placeholder="What this cost you"
                        value={data.purchase_price}
                        onChange={(e) =>
                            setData('purchase_price', e.target.value)
                        }
                    />
                    {errors.purchase_price && (
                        <p className="text-xs text-destructive">
                            {errors.purchase_price}
                        </p>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="discount_price">Discount Price (BDT)</Label>
                    <Input
                        id="discount_price"
                        type="number"
                        min={0}
                        value={data.discount_price}
                        onChange={(e) => {
                            const nextDiscountPrice = e.target.value;
                            setData('discount_price', nextDiscountPrice);

                            const original = Number(data.original_price);
                            const discountPrice = Number(nextDiscountPrice);

                            if (nextDiscountPrice !== '' && original > 0) {
                                setData(
                                    'discount_percentage',
                                    String(
                                        Math.round(
                                            ((original - discountPrice) /
                                                original) *
                                                10000,
                                        ) / 100,
                                    ),
                                );
                            } else if (nextDiscountPrice === '') {
                                setData('discount_percentage', '');
                            }
                        }}
                    />
                    {errors.discount_price && (
                        <p className="text-xs text-destructive">
                            {errors.discount_price}
                        </p>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="discount_percentage">Discount %</Label>
                    <Input
                        id="discount_percentage"
                        type="number"
                        min={0}
                        max={100}
                        value={data.discount_percentage}
                        onChange={(e) => {
                            const nextPct = e.target.value;
                            setData('discount_percentage', nextPct);

                            const original = Number(data.original_price);
                            const pct = Number(nextPct);

                            if (nextPct !== '' && original > 0) {
                                setData(
                                    'discount_price',
                                    String(
                                        Math.round(
                                            original * (1 - pct / 100),
                                        ),
                                    ),
                                );
                            } else if (nextPct === '') {
                                setData('discount_price', '');
                            }
                        }}
                    />
                    {errors.discount_percentage && (
                        <p className="text-xs text-destructive">
                            {errors.discount_percentage}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="release_date">Release Date</Label>
                    <Input
                        id="release_date"
                        type="date"
                        value={data.release_date}
                        onChange={(e) =>
                            setData('release_date', e.target.value)
                        }
                    />
                </div>

                <label className="flex items-center gap-2 self-end pb-2 text-sm">
                    <Checkbox
                        checked={data.is_featured}
                        onCheckedChange={(checked) =>
                            setData('is_featured', checked === true)
                        }
                    />
                    Featured
                </label>
            </div>

            <div className="grid gap-2">
                <Label>Images</Label>
                <p className="text-xs text-muted-foreground">
                    Add as many photos as you like. The first photo is the main
                    image shown on the product card — hover any other photo and
                    click the star to make it the main image.
                </p>

                <div className="flex flex-wrap gap-3">
                    {gallery.map((item, index) => (
                        <div key={item.id} className="group relative">
                            <img
                                src={
                                    item.kind === 'existing'
                                        ? item.url
                                        : URL.createObjectURL(item.file)
                                }
                                alt=""
                                className={`size-20 rounded-md border object-cover ${
                                    index === 0
                                        ? 'border-2 border-primary'
                                        : 'border-input'
                                }`}
                            />
                            {index === 0 && (
                                <span className="absolute bottom-0 left-0 w-full rounded-b-md bg-primary py-0.5 text-center text-[9px] font-semibold tracking-wide text-primary-foreground uppercase">
                                    Main
                                </span>
                            )}
                            {index !== 0 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        makeGalleryImageMain(item.id)
                                    }
                                    aria-label="Set as main image"
                                    title="Set as main image"
                                    className="absolute -top-2 -left-2 flex size-6 items-center justify-center rounded-full bg-amber-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                    <Star className="size-3" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => removeGalleryImage(item.id)}
                                aria-label="Remove image"
                                className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-destructive text-white"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    ))}

                    <label className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-input text-muted-foreground transition-colors hover:border-ring hover:text-foreground">
                        <ImagePlus className="size-5" />
                        <span className="text-[10px] font-medium uppercase">
                            Add
                        </span>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                addImages(Array.from(e.target.files ?? []));
                                e.target.value = '';
                            }}
                            className="hidden"
                        />
                    </label>
                </div>
                {errors.images && (
                    <p className="text-xs text-destructive">{errors.images}</p>
                )}
            </div>

            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label>Sizes &amp; Stock</Label>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addVariant}
                    >
                        <Plus className="size-4" />
                        Add Size
                    </Button>
                </div>

                <div className="flex flex-col gap-2">
                    {data.variants.map((variant, index) => (
                        <div
                            key={variant.id ?? `new-${index}`}
                            className="flex items-center gap-2"
                        >
                            <Input
                                placeholder="Size (e.g. 42)"
                                value={variant.size}
                                onChange={(e) =>
                                    updateVariant(index, 'size', e.target.value)
                                }
                                className="w-32"
                                required
                            />
                            <Input
                                type="number"
                                min={0}
                                placeholder="Stock"
                                value={variant.stock_quantity}
                                onChange={(e) =>
                                    updateVariant(
                                        index,
                                        'stock_quantity',
                                        Number(e.target.value),
                                    )
                                }
                                className="w-28"
                                required
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => removeVariant(index)}
                                disabled={data.variants.length <= 1}
                                aria-label="Remove size"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                {errors.variants && (
                    <p className="text-xs text-destructive">
                        {errors.variants}
                    </p>
                )}
            </div>

            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Size Guide</Label>
                        <p className="text-xs text-muted-foreground">
                            Shown to customers on this product's page. Starts
                            from the default chart — edit rows to match this
                            specific shoe.
                        </p>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addSizeChartRow}
                    >
                        <Plus className="size-4" />
                        Add Row
                    </Button>
                </div>

                <div className="flex flex-col gap-2">
                    {data.size_chart.map((row, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                placeholder="EU"
                                value={row.size}
                                onChange={(e) =>
                                    updateSizeChartRow(
                                        index,
                                        'size',
                                        e.target.value,
                                    )
                                }
                                className="w-20"
                            />
                            <Input
                                placeholder="US"
                                value={row.us}
                                onChange={(e) =>
                                    updateSizeChartRow(
                                        index,
                                        'us',
                                        e.target.value,
                                    )
                                }
                                className="w-20"
                            />
                            <Input
                                placeholder="UK"
                                value={row.uk}
                                onChange={(e) =>
                                    updateSizeChartRow(
                                        index,
                                        'uk',
                                        e.target.value,
                                    )
                                }
                                className="w-20"
                            />
                            <Input
                                placeholder="CM"
                                value={row.cm}
                                onChange={(e) =>
                                    updateSizeChartRow(
                                        index,
                                        'cm',
                                        e.target.value,
                                    )
                                }
                                className="w-20"
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => removeSizeChartRow(index)}
                                aria-label="Remove row"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                {errors.size_chart && (
                    <p className="text-xs text-destructive">
                        {errors.size_chart}
                    </p>
                )}
            </div>

            <Button type="submit" disabled={processing} className="w-fit">
                {submitLabel}
            </Button>
        </form>
    );
}
